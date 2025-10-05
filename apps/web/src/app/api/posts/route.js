import { create } from '../utils/create';

export const GET = create(async ({ supabase, req }) => {
  const userId = req.user?.id || null;

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id,image_url,caption,created_at,profiles:profiles(username,avatar_url)')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return Response.json({ success: false, error: error.message }, { status: 500 });

  const ids = posts.map(p => p.id);
  if (ids.length === 0) return Response.json({ success: true, posts });

  const [likeCountsRes, commentCountsRes, myLikesRes] = await Promise.all([
    supabase.from('post_likes').select('post_id, count:post_id').in('post_id', ids).group('post_id'),
    supabase.from('post_comments').select('post_id, count:post_id').in('post_id', ids).group('post_id'),
    userId ? supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', ids) : Promise.resolve({ data: [] })
  ]);

  const likeMap = Object.fromEntries((likeCountsRes.data || []).map(r => [r.post_id, r.count]));
  const commentMap = Object.fromEntries((commentCountsRes.data || []).map(r => [r.post_id, r.count]));
  const myLikeSet = new Set((myLikesRes.data || []).map(r => r.post_id));

  const enriched = posts.map(p => ({
    ...p,
    like_count: likeMap[p.id] || 0,
    comment_count: commentMap[p.id] || 0,
    liked_by_me: myLikeSet.has(p.id)
  }));

  return Response.json({ success: true, posts: enriched }, { headers: { 'Cache-Control': 'no-store' } });
});

export const POST = create(async ({ supabase, req }) => {
  const userId = req.user.id;
  const body = await req.json();
  const { image_url, caption } = body || {};
  if (!image_url) return Response.json({ success: false, error: 'image_url required' }, { status: 400 });

  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, image_url, caption })
    .select()
    .single();
  if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
  return Response.json({ success: true, post: data }, { status: 201 });
});


