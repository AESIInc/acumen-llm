import { createClient } from '@/lib/supabase/server';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentById,
  saveDocument,
} from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const document = await getDocumentById({ id });

  if (!document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  if (document.userId !== user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json(document);
}

export async function POST(request: NextRequest) {
  const { id, title, content, kind } = await request.json();

  if (!id || !title || !content || !kind) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const document = await getDocumentById({ id });

  if (!document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  if (document.userId !== user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const timestamp = new Date();
  
  await deleteDocumentsByIdAfterTimestamp({ id, timestamp });

  await saveDocument({
    id,
    title,
    content,
    kind,
    userId: user.id,
  });

  return Response.json({ title });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const document = await getDocumentById({ id });

  if (!document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  if (document.userId !== user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await deleteDocumentsByIdAfterTimestamp({ 
    id, 
    timestamp: new Date(0) // Delete all versions
  });

  return Response.json({ success: true });
}
