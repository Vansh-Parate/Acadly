import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

type Msg = { id: string; role: "user" | "ai"; text: string }

export default function AIAssistant() {
  const [open, setOpen] = React.useState(false)
  const [msgs, setMsgs] = React.useState<Msg[]>([
    { id: "m1", role: "ai", text: "Hi! Ask me a quick question or describe what you need help with." },
  ])
  const [input, setInput] = React.useState("")

  const send = () => {
    if (!input.trim()) return
    const id = Math.random().toString(36).slice(2)
    const myMsg: Msg = { id, role: "user", text: input.trim() }
    setMsgs((m) => [...m, myMsg])
    setInput("")
    // Fake AI reply
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          id: Math.random().toString(36).slice(2),
          role: "ai",
          text:
            "Thanks! Based on that, I recommend a mentor with strong problem-solving in your subject. You can also share a screenshot if needed.",
        },
      ])
    }, 600)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="fixed bottom-4 right-4 z-50 w-[min(90vw,360px)]"
          >
            <Card className="p-3 md:p-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-foreground/10 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-sm font-medium">AI Assistant</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close assistant">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-56 rounded-md border bg-background p-3">
                <div className="space-y-3">
                  {msgs.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                      className={`text-sm leading-relaxed ${m.role === "user" ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {m.text}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  placeholder="Ask a quick question…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                />
                <Button onClick={send}>Send</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Assistant"
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 shadow"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">Ask AI</span>
      </motion.button>
    </>
  )
}
