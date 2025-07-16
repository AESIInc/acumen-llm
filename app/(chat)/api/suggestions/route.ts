import { createClient } from '@/lib/supabase/server';
import { getSuggestionsByDocumentId } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return Response.json({ error: 'Missing documentId' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const suggestions = await getSuggestionsByDocumentId({ documentId });
  
  // Filter suggestions to only those belonging to the current user
  const userSuggestions = suggestions.filter(suggestion => suggestion.userId === user.id);

  return Response.json(userSuggestions);
}
