import { createClient } from "@/lib/supabase/server";
import ChatWindow from "@/components/chat/chatWindow";
import { notFound } from "next/navigation";

export default async function ChatPage({ params }) {
  const supabase = await createClient()

  const { companionId } = await params

  const { data: companion, error } = await supabase
    .from('companions')
    .select('*')
    .eq('id', companionId)
    .single()

  if (error || !companion) notFound()

  return <ChatWindow companion={companion} />
}