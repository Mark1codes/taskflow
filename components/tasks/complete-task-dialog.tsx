import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"

interface CompleteTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (note: string) => Promise<void>
  taskTitle: string
}

export function CompleteTaskDialog({ isOpen, onClose, onConfirm, taskTitle }: CompleteTaskDialogProps) {
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(note.trim())
      setNote("")
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset note when closed/opened
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNote("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Complete Task
          </DialogTitle>
          <DialogDescription>
            You are about to mark "{taskTitle}" as complete.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="note" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Completion Note (Optional)
            </label>
            <Textarea
              id="note"
              placeholder="Add a final note or comment for your team..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-24 resize-none"
            />
            <p className="text-xs text-slate-500">
              This note will be visible to everyone who views this task.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isSubmitting ? "Completing..." : "Complete Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
