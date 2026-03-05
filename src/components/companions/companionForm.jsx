'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from "sonner"
import { Loader2, Upload, X } from 'lucide-react'

const PERSONALITY_TRAITS = [
  'Friendly', 'Professional', 'Humorous', 'Empathetic',
  'Supportive', 'Creative', 'Logical', 'Motivational'
]

const COMMUNICATION_STYLES = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'calm', label: 'Calm' },
  { value: 'playful', label: 'Playful' },
]

const EXPERTISE_AREAS = [
  { value: 'general', label: 'General' },
  { value: 'tech', label: 'Technology' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'education', label: 'Education' },
  { value: 'fitness', label: 'Fitness' },
]

const RELATIONSHIP_TYPES = [
  { value: 'friend', label: 'Friend' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'coach', label: 'Coach' },
]

export default function CompanionForm({ initialData = null }) {
  const isEditing = !!initialData
  const router = useRouter()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    avatar_url: initialData?.avatar_url || '',
    personality_traits: initialData?.personality_traits || [],
    communication_style: initialData?.communication_style || '',
    expertise_area: initialData?.expertise_area || '',
    system_prompt: initialData?.system_prompt || '',
    background_story: initialData?.background_story || '',
    relationship_type: initialData?.relationship_type || '',
  })

  const toggleTrait = (trait) => {
    setForm(prev => ({
      ...prev,
      personality_traits: prev.personality_traits.includes(trait)
        ? prev.personality_traits.filter(t => t !== trait)
        : [...prev.personality_traits, trait]
    }))
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }

    setAvatarUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const fileExt = file.name.split('.').pop()
      const filePath = `companions/${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setForm(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Avatar uploaded!')
    } catch (error) {
      toast.error('Upload failed', { description: error.message })
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Companion name is required')
      return
    }

    setLoading(true)
    try {
      const url = isEditing
        ? `/api/companions/${initialData.id}`
        : '/api/companions'

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast.success(isEditing ? 'Companion updated!' : 'Companion created!')

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">

      {/* ── Basic Details ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Details</h2>

        {/* Avatar Upload */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden flex-shrink-0">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="avatar" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={avatarUploading}
                onClick={() => document.getElementById('avatar-input').click()}
              >
                {avatarUploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                ) : (
                  'Upload Avatar'
                )}
              </Button>
            </Label>
            <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Companion Name *</Label>
          <Input
            id="name"
            placeholder="e.g. Alex, Luna, Max"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description</Label>
          <Input
            id="description"
            placeholder="e.g. A friendly tech-savvy companion"
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </section>

      {/* ── Personality Configuration ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Personality</h2>

        <div className="space-y-2">
          <Label>Personality Traits</Label>
          <p className="text-xs text-muted-foreground">Select all that apply</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {PERSONALITY_TRAITS.map(trait => (
              <Badge
                key={trait}
                variant={form.personality_traits.includes(trait) ? 'default' : 'outline'}
                className="cursor-pointer select-none text-sm py-1 px-3"
                onClick={() => toggleTrait(trait)}
              >
                {form.personality_traits.includes(trait) && (
                  <X className="w-3 h-3 mr-1" />
                )}
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Communication Style</Label>
            <Select
              value={form.communication_style}
              onValueChange={val => setForm(prev => ({ ...prev, communication_style: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_STYLES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Expertise Area</Label>
            <Select
              value={form.expertise_area}
              onValueChange={val => setForm(prev => ({ ...prev, expertise_area: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {EXPERTISE_AREAS.map(e => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Relationship Type</Label>
            <Select
              value={form.relationship_type}
              onValueChange={val => setForm(prev => ({ ...prev, relationship_type: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_TYPES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ── Background & Behavior ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Background & Behavior</h2>

        <div className="space-y-2">
          <Label htmlFor="background_story">Background Story</Label>
          <Textarea
            id="background_story"
            placeholder="Give your companion a backstory. e.g. 'A seasoned software engineer who loves helping people learn to code...'"
            value={form.background_story}
            onChange={e => setForm(prev => ({ ...prev, background_story: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="system_prompt">
            Custom Instructions
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              (Advanced — how should this companion behave?)
            </span>
          </Label>
          <Textarea
            id="system_prompt"
            placeholder="e.g. Always respond in a warm tone. Use simple language. Add a motivational quote at the end of each message."
            value={form.system_prompt}
            onChange={e => setForm(prev => ({ ...prev, system_prompt: e.target.value }))}
            rows={4}
          />
        </div>
      </section>

      {/* ── Submit ── */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Save Changes' : 'Create Companion'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}