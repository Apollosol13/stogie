import { create } from '../../../utils/create';

export const GET = create(async ({ supabase, params }) => {
  const postId = Number(params.id);
  const { data, error } = await supabase
    .from('post_comments')
    .select('id, text, created_at, profiles:profiles(username, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
  return Response.json({ success: true, comments: data }, { headers: { 'Cache-Control': 'no-store' } });
});

export const POST = create(async ({ supabase, req, params }) => {
  const userId = req.user.id;
  const postId = Number(params.id);
  const body = await req.json();
  const text = (body?.text || '').trim();
  if (!text) return Response.json({ success: false, error: 'text required' }, { status: 400 });

  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, user_id: userId, text })
    .select('id, text, created_at, profiles:profiles(username, avatar_url)')
    .single();
  if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
  return Response.json({ success: true, comment: data }, { status: 201 });
});


