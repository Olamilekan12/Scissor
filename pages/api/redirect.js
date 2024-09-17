import { supabase } from '../../src/db/supabase';

export default function handler(req, res) {
  res.status(200).json({ message: 'API route reached', slug: req.query.slug });


  const { slug } = req.query;

  // Fetch the original URL from Supabase using the slug
  const { data, error } = await supabase
    .from('urls')
    .select('original_url')
    .eq('short_url', slug)
    .single();

  if (error || !data) {
    return res.status(404).json({ message: 'URL not found' });
  }

  // Redirect to the original URL
  res.writeHead(302, { Location: data.original_url });
  res.end();
}
