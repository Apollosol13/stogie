import { create } from '../../../utils/create';

export const POST = create(async ({ supabase, req, params }) => {
  const userId = req.user.id;
  const postId = Number(params.id);

  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  }

  const { count } = await supabase
    .from('post_likes')
    .select('post_id', { head: true, count: 'exact' })
    .eq('post_id', postId);

  return Response.json({ success: true, liked: !existing, like_count: count || 0 });
});


