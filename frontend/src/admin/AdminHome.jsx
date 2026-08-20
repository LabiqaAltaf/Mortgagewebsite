import { useEffect, useState } from 'react'
import * as api from '../api/client.js'
import { Card, Loading, useToast } from './ui.jsx'

/**
 * Admin Home — control centre for the public homepage.
 * Edits Hero, About (Google Reviews / Top Rated Brokers) and
 * What we do (Approach). Values are saved through the protected
 * PATCH /api/content API into MongoDB (PublicContent) and the public
 * homepage reads them via GET /api/content/public, so edits made here
 * appear live on the public site.
 */
const EMPTY_HERO = {
  heading1: '',
  heading2: '',
  description: '',
  primaryCta: { label: '', href: '' },
  secondaryCta: { label: '', href: '' },
  image: '',
}

const EMPTY_REVIEWS = {
  eyebrow: '',
  heading1: '',
  heading2: '',
  paragraph: '',
  reviewerName: '',
  reviewerLocation: '',
}

const EMPTY_APPROACH_HEADING = {
  eyebrow: '',
  paragraph: '',
}

const EMPTY_APPROACH_CTA = {
  label: 'Get Start Online',
  href: '/apply',
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // ~4MB before base64

export default function AdminHome() {
  const toast = useToast()
  const [content, setContent] = useState(null)
  const [hero, setHero] = useState(EMPTY_HERO)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savingAbout, setSavingAbout] = useState(false)
  const [savingApproach, setSavingApproach] = useState(false)

  const [reviews, setReviews] = useState(EMPTY_REVIEWS)
  const [reviewStats, setReviewStats] = useState([])
  const [aboutEntries, setAboutEntries] = useState([])
  const [approachHeading, setApproachHeading] = useState(EMPTY_APPROACH_HEADING)
  const [approachWords, setApproachWords] = useState([])
  const [approachCta, setApproachCta] = useState(EMPTY_APPROACH_CTA)
  const [approachImages, setApproachImages] = useState({ interiorLarge: '', interiorSmall: '' })

  useEffect(() => {
    let cancelled = false
    api
      .getAdminContent()
      .then((r) => {
        if (cancelled) return
        setContent(r.content)
        const base = r.content.hero || {}
        setHero({
          heading1: base.heading1 || '',
          heading2: base.heading2 || '',
          description: base.description || '',
          primaryCta: {
            label: base.primaryCta?.label || '',
            href: base.primaryCta?.href || '/apply',
          },
          secondaryCta: {
            label: base.secondaryCta?.label || '',
            href: base.secondaryCta?.href || '#about',
          },
          image: base.image || '',
        })

        const rb = r.content || {}
        setReviews({
          eyebrow: rb.reviews?.eyebrow || '',
          heading1: rb.reviews?.heading1 || '',
          heading2: rb.reviews?.heading2 || '',
          paragraph: rb.reviews?.paragraph || '',
          reviewerName: rb.reviews?.reviewerName || '',
          reviewerLocation: rb.reviews?.reviewerLocation || '',
        })
        setReviewStats(Array.isArray(rb.reviewStats) ? rb.reviewStats.map((s) => ({ ...s })) : [])
        setAboutEntries(Array.isArray(rb.aboutEntries) ? rb.aboutEntries.map((entry) => ({ ...entry })) : [])
        setApproachHeading({
          eyebrow: rb.approachHeading?.eyebrow || '',
          paragraph: rb.approachHeading?.paragraph || '',
        })
        setApproachWords(Array.isArray(rb.approachWords) ? rb.approachWords.map((w) => ({ ...w })) : [])
        setApproachCta({
          label: rb.approachCta?.label || 'Get Start Online',
          href: rb.approachCta?.href || '/apply',
        })
        setApproachImages({
          interiorLarge: rb.websiteImages?.interiorLarge || '',
          interiorSmall: rb.websiteImages?.interiorSmall || '',
        })
      })
      .catch((e) => toast.error(e.message || 'Unable to load homepage content.'))
    return () => {
      cancelled = true
    }
  }, [toast])

  const setField = (field, value) => setHero((prev) => ({ ...prev, [field]: value }))
  const setCta = (which, field, value) =>
    setHero((prev) => ({ ...prev, [which]: { ...prev[which], [field]: value } }))

  const onUpload = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (PNG, JPG, WebP…).')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image is too large. Please use an image under 4MB.')
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setHero((prev) => ({ ...prev, image: String(reader.result) }))
      setUploading(false)
    }
    reader.onerror = () => {
      setUploading(false)
      toast.error('Unable to read the selected image.')
    }
    reader.readAsDataURL(file)
  }


  const save = async () => {
    const normalized = {
      heading1: hero.heading1.trim(),
      heading2: hero.heading2.trim(),
      description: hero.description.trim(),
      primaryCta: {
        label: hero.primaryCta.label.trim() || 'Get Start Online',
        href: hero.primaryCta.href.trim() || '/apply',
      },
      secondaryCta: {
        label: hero.secondaryCta.label.trim() || 'Learn More',
        href: hero.secondaryCta.href.trim() || '#about',
      },
      image: hero.image.trim(),
    }
    if (!normalized.heading1 || !normalized.heading2) {
      toast.error('Both heading lines are required.')
      return
    }

    setSaving(true)
    try {
      // Save both the hero.image and websiteImages.hero so the public hero
      // visual stays consistent for current and future consumers.
      const currentImages = content?.websiteImages || {}
      const currentHeroImage = normalized.image || currentImages.hero || ''
      const payload = {
        hero: normalized,
        websiteImages: { ...currentImages, hero: currentHeroImage },
      }
      await api.updateAdminContent(payload)
      setContent((prev) => ({
        ...prev,
        hero: normalized,
        websiteImages: payload.websiteImages,
      }))
      toast.success('Homepage hero updated. The public site now shows the new content.')
    } catch (e) {
      toast.error(e.message || 'Unable to save hero changes.')
    } finally {
      setSaving(false)
    }
  }

  // ---- About (Google Reviews / Top Rated Brokers) ----
  const setReviewField = (field, value) => setReviews((prev) => ({ ...prev, [field]: value }))
  const updateReviewStat = (index, field, value) =>
    setReviewStats((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  const addReviewStat = () => setReviewStats((prev) => [...prev, { value: '', label: '' }])
  const removeReviewStat = (index) => setReviewStats((prev) => prev.filter((_, i) => i !== index))
  const updateAboutEntry = (index, field, value) => setAboutEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)))
  const addAboutEntry = () => setAboutEntries((prev) => [...prev, { heading1: '', heading2: '', paragraph: '', reviewerName: '', reviewerLocation: '' }])
  const removeAboutEntry = (index) => setAboutEntries((prev) => prev.filter((_, i) => i !== index))

  const saveAbout = async () => {
    const normalized = {
      eyebrow: reviews.eyebrow.trim(),
      heading1: reviews.heading1.trim(),
      heading2: reviews.heading2.trim(),
      paragraph: reviews.paragraph.trim(),
      reviewerName: reviews.reviewerName.trim(),
      reviewerLocation: reviews.reviewerLocation.trim(),
    }
    if (!normalized.heading1 || !normalized.heading2) {
      toast.error('Both About heading lines are required.')
      return
    }
    const normalizedStats = reviewStats
      .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
      .filter((s) => s.value || s.label)
    const normalizedEntries = aboutEntries.map((entry) => ({
      heading1: String(entry.heading1 || '').trim(),
      heading2: String(entry.heading2 || '').trim(),
      paragraph: String(entry.paragraph || '').trim(),
      reviewerName: String(entry.reviewerName || '').trim(),
      reviewerLocation: String(entry.reviewerLocation || '').trim(),
    })).filter((entry) => entry.heading1 || entry.heading2 || entry.paragraph || entry.reviewerName || entry.reviewerLocation)

    setSavingAbout(true)
    try {
      const payload = { reviews: normalized, reviewStats: normalizedStats, aboutEntries: normalizedEntries }
      await api.updateAdminContent(payload)
      setContent((prev) => ({ ...prev, reviews: normalized, reviewStats: normalizedStats, aboutEntries: normalizedEntries }))
      toast.success('About section updated. The public site now shows the new content.')
    } catch (e) {
      toast.error(e.message || 'Unable to save About changes.')
    } finally {
      setSavingAbout(false)
    }
  }

  // ---- What we do (Approach) ----
  const setApproachField = (field, value) => setApproachHeading((prev) => ({ ...prev, [field]: value }))
  const setCtaField = (field, value) => setApproachCta((prev) => ({ ...prev, [field]: value }))
  const updateApproachWord = (index, field, value) =>
    setApproachWords((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  const addApproachWord = () => setApproachWords((prev) => [...prev, { number: '', label: '' }])
  const removeApproachWord = (index) => setApproachWords((prev) => prev.filter((_, i) => i !== index))

  const onApproachImageUpload = (which) => (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (PNG, JPG, WebP…).')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image is too large. Please use an image under 4MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setApproachImages((prev) => ({ ...prev, [which]: String(reader.result) }))
    }
    reader.onerror = () => toast.error('Unable to read the selected image.')
    reader.readAsDataURL(file)
  }

  const saveApproach = async () => {
    const normalized = {
      eyebrow: approachHeading.eyebrow.trim(),
      paragraph: approachHeading.paragraph.trim(),
    }
    const normalizedWords = approachWords
      .map((w) => ({ number: w.number.trim(), label: w.label.trim() }))
      .filter((w) => w.number || w.label)
    const normalizedCta = {
      label: approachCta.label.trim() || 'Get Start Online',
      href: approachCta.href.trim() || '/apply',
    }
    const currentImages = content?.websiteImages || {}
    const normalizedImages = {
      interiorLarge: approachImages.interiorLarge.trim(),
      interiorSmall: approachImages.interiorSmall.trim(),
    }

    setSavingApproach(true)
    try {
      const payload = {
        approachHeading: normalized,
        approachWords: normalizedWords,
        approachCta: normalizedCta,
        websiteImages: { ...currentImages, ...normalizedImages },
      }
      await api.updateAdminContent(payload)
      setContent((prev) => ({
        ...prev,
        approachHeading: normalized,
        approachWords: normalizedWords,
        approachCta: normalizedCta,
        websiteImages: { ...currentImages, ...normalizedImages },
      }))
      toast.success('What we do section updated. The public site now shows the new content.')
    } catch (e) {
      toast.error(e.message || 'Unable to save What we do changes.')
    } finally {
      setSavingApproach(false)
    }
  }

  if (!content) return <Loading label="Loading homepage content…" />

  const heroImage = hero.image || content?.websiteImages?.hero || ''

  return (
    <div>
      <div className="a-home-head">
        <div>
          <h2 className="a-home-title">Home</h2>
          <p className="a-hint">
            Controls the public homepage Hero, About (Google Reviews / Top Rated Brokers) and
            What we do (Approach) sections. Changes are saved to MongoDB and appear on the live
            website immediately — no code changes required.
          </p>
        </div>
        <button className="a-btn a-btn-brand" onClick={save} disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save hero'}
        </button>
      </div>

      <div className="a-dash-cols a-home-grid">
        <Card title="Hero content">
          <label className="a-field">
            <span>Heading — line 1</span>
            <input
              value={hero.heading1}
              onChange={(e) => setField('heading1', e.target.value)}
              placeholder="EXPERTS IN GETTING"
            />
          </label>

          <label className="a-field">
            <span>Heading — line 2</span>
            <input
              value={hero.heading2}
              onChange={(e) => setField('heading2', e.target.value)}
              placeholder="YOU APPROVED"
            />
          </label>

          <label className="a-field">
            <span>Description</span>
            <textarea
              rows={3}
              value={hero.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Struggling to get a mortgage? We specialize in approvals…"
            />
          </label>

          <div className="a-home-subhead">
            <span>Primary CTA</span>
            <small>The Get Start Online button.</small>
          </div>
          <div className="a-home-two">
            <label className="a-field">
              <span>Text</span>
              <input
                value={hero.primaryCta.label}
                onChange={(e) => setCta('primaryCta', 'label', e.target.value)}
                placeholder="Get Start Online"
              />
            </label>
            <label className="a-field">
              <span>Destination</span>
              <input
                value={hero.primaryCta.href}
                onChange={(e) => setCta('primaryCta', 'href', e.target.value)}
                placeholder="/apply"
              />
            </label>
          </div>

          <div className="a-home-subhead">
            <span>Secondary CTA</span>
            <small>The Learn More button.</small>
          </div>
          <div className="a-home-two">
            <label className="a-field">
              <span>Text</span>
              <input
                value={hero.secondaryCta.label}
                onChange={(e) => setCta('secondaryCta', 'label', e.target.value)}
                placeholder="Learn More"
              />
            </label>
            <label className="a-field">
              <span>Destination</span>
              <input
                value={hero.secondaryCta.href}
                onChange={(e) => setCta('secondaryCta', 'href', e.target.value)}
                placeholder="#about"
              />
            </label>
          </div>

          <p className="a-hint a-home-hint">
            Destinations starting with <code>/</code> open an internal page (use{' '}
            <code>/apply</code> for the Get Started Online experience), <code>#</code> scrolls to an
            in-page anchor, and <code>http(s)://</code> opens an external site.
          </p>
        </Card>

        <Card title="Hero image">
          <div className="a-home-preview">
            {heroImage ? (
              <img src={heroImage} alt="Hero preview" />
            ) : (
              <div className="a-home-preview-empty">No image selected.</div>
            )}
          </div>

          <label className="a-field">
            <span>Image URL</span>
            <input
              value={hero.image.startsWith('data:') ? '(uploaded image)' : hero.image}
              onChange={(e) => setField('image', e.target.value)}
              placeholder="https://… or images.unsplash.com/…"
            />
          </label>

          <label className="a-file-btn">
            <input
              type="file"
              accept="image/*"
              disabled={saving || uploading}
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
            {uploading ? 'Uploading…' : 'Upload image'}
          </label>

          {hero.image && (
            <button className="a-btn a-btn-ghost a-home-bare" onClick={() => setField('image', '')} disabled={saving}>
              Remove image
            </button>
          )}

          <p className="a-hint a-home-hint">
            Paste an image URL or upload a file (up to 4MB). The public hero uses this image
            immediately after you save.
          </p>
        </Card>
      </div>

      <div className="a-home-head a-home-section-head">
        <div><h2 className="a-home-title">About entries</h2><p className="a-hint">Add, edit or remove the entries navigated by the existing public chevrons.</p></div>
        <button className="a-btn a-btn-brand" onClick={saveAbout} disabled={savingAbout}>{savingAbout ? 'Saving…' : 'Save About entries'}</button>
      </div>
      <Card title="About entries">
        {aboutEntries.map((entry, index) => <div key={index} className="a-item-group">
          <label className="a-field"><span>Heading line 1</span><input value={entry.heading1 || ''} onChange={(e) => updateAboutEntry(index, 'heading1', e.target.value)} /></label>
          <label className="a-field"><span>Heading line 2</span><input value={entry.heading2 || ''} onChange={(e) => updateAboutEntry(index, 'heading2', e.target.value)} /></label>
          <label className="a-field"><span>Paragraph</span><textarea rows={3} value={entry.paragraph || ''} onChange={(e) => updateAboutEntry(index, 'paragraph', e.target.value)} /></label>
          <div className="a-home-two"><label className="a-field"><span>Name</span><input value={entry.reviewerName || ''} onChange={(e) => updateAboutEntry(index, 'reviewerName', e.target.value)} /></label><label className="a-field"><span>Location</span><input value={entry.reviewerLocation || ''} onChange={(e) => updateAboutEntry(index, 'reviewerLocation', e.target.value)} /></label></div>
          <button className="a-btn a-btn-sm a-btn-danger-ghost" onClick={() => removeAboutEntry(index)} disabled={savingAbout}>Remove entry</button>
        </div>)}
        <button className="a-btn a-btn-sm a-btn-ghost" onClick={addAboutEntry} disabled={savingAbout}>Add About entry</button>
      </Card>

      <div className="a-home-head a-home-section-head">
        <div>
          <h2 className="a-home-title">About — Google Reviews / Top Rated Brokers</h2>
          <p className="a-hint">
            Controls the public "About" section (the Google Reviews block the "About" menu link
            scrolls to): heading, paragraph, reviewer details and the stat items below. The{' '}
            <code>&lt;</code> <code>&gt;</code> chevrons on the public section stay exactly as they
            are today.
          </p>
        </div>
        <button className="a-btn a-btn-brand" onClick={saveAbout} disabled={saving || savingAbout}>
          {savingAbout ? 'Saving…' : 'Save About'}
        </button>
      </div>

      <div className="a-dash-cols a-home-grid">
        <Card title="About content">
          <label className="a-field">
            <span>Eyebrow / label</span>
            <input
              value={reviews.eyebrow}
              onChange={(e) => setReviewField('eyebrow', e.target.value)}
              placeholder="Google Reviews"
            />
          </label>

          <div className="a-home-two">
            <label className="a-field">
              <span>Heading — line 1</span>
              <input
                value={reviews.heading1}
                onChange={(e) => setReviewField('heading1', e.target.value)}
                placeholder="ONE OF THE UK'S TOP RATED"
              />
            </label>
            <label className="a-field">
              <span>Heading — line 2</span>
              <input
                value={reviews.heading2}
                onChange={(e) => setReviewField('heading2', e.target.value)}
                placeholder="MORTGAGE BROKERS"
              />
            </label>
          </div>

          <label className="a-field">
            <span>Paragraph</span>
            <textarea
              rows={3}
              value={reviews.paragraph}
              onChange={(e) => setReviewField('paragraph', e.target.value)}
              placeholder="Every client gets a dedicated expert…"
            />
          </label>

          <div className="a-home-subhead">
            <span>Reviewer / client</span>
            <small>The name and location shown under the paragraph.</small>
          </div>
          <div className="a-home-two">
            <label className="a-field">
              <span>Name</span>
              <input
                value={reviews.reviewerName}
                onChange={(e) => setReviewField('reviewerName', e.target.value)}
                placeholder="Brain Dominal"
              />
            </label>
            <label className="a-field">
              <span>Location</span>
              <input
                value={reviews.reviewerLocation}
                onChange={(e) => setReviewField('reviewerLocation', e.target.value)}
                placeholder="Barcelona, Spain"
              />
            </label>
          </div>
        </Card>
        <Card title="About — stat items">
          <p className="a-hint">
            These are the two items shown next to the heading (currently 19+ / Monthly project
            finished and 4.8 / Rating on Crunchbase). Add, edit or remove them freely.
          </p>
          {reviewStats.map((stat, index) => (
            <div key={index} className="a-item-group">
              <div className="a-home-two">
                <label className="a-field">
                  <span>Value</span>
                  <input
                    value={stat.value}
                    onChange={(e) => updateReviewStat(index, 'value', e.target.value)}
                    placeholder="19+"
                  />
                </label>
                <label className="a-field">
                  <span>Label</span>
                  <input
                    value={stat.label}
                    onChange={(e) => updateReviewStat(index, 'label', e.target.value)}
                    placeholder="Monthly project finished"
                  />
                </label>
              </div>
              <button
                className="a-btn a-btn-sm a-btn-danger-ghost"
                onClick={() => removeReviewStat(index)}
                disabled={savingAbout}
              >
                <i className="bi bi-trash" /> Remove this item
              </button>
            </div>
          ))}
          <button className="a-btn a-btn-sm a-btn-ghost" onClick={addReviewStat} disabled={savingAbout}>
            <i className="bi bi-plus-lg" /> Add stat item
          </button>
        </Card>
      </div>

      <div className="a-home-head a-home-section-head">
        <div>
          <h2 className="a-home-title">What we do — Approach</h2>
          <p className="a-hint">
            Controls the public "What we do?" section: eyebrow, paragraph, the four feature words,
            the two interior images and the floating circular "Get Start Online" button.
          </p>
        </div>
        <button className="a-btn a-btn-brand" onClick={saveApproach} disabled={saving || savingApproach}>
          {savingApproach ? 'Saving…' : 'Save What we do'}
        </button>
      </div>

      <div className="a-dash-cols a-home-grid">
        <Card title="What we do content">
          <label className="a-field">
            <span>Eyebrow / heading</span>
            <input
              value={approachHeading.eyebrow}
              onChange={(e) => setApproachField('eyebrow', e.target.value)}
              placeholder="What we do?"
            />
          </label>

          <label className="a-field">
            <span>Paragraph</span>
            <textarea
              rows={3}
              value={approachHeading.paragraph}
              onChange={(e) => setApproachField('paragraph', e.target.value)}
              placeholder="We specialise in arranging mortgages for people who've been turned down elsewhere…"
            />
          </label>

          <div className="a-home-subhead">
            <span>Circular button</span>
            <small>The floating "Get Start Online" circle on the image composition.</small>
          </div>
          <div className="a-home-two">
            <label className="a-field">
              <span>Button text</span>
              <input
                value={approachCta.label}
                onChange={(e) => setCtaField('label', e.target.value)}
                placeholder="Get Start Online"
              />
            </label>
            <label className="a-field">
              <span>Destination</span>
              <input
                value={approachCta.href}
                onChange={(e) => setCtaField('href', e.target.value)}
                placeholder="/apply"
              />
            </label>
          </div>
          <p className="a-hint a-home-hint">
            Destinations starting with <code>/</code> open an internal page, <code>#</code> scrolls
            to an in-page anchor, and <code>http(s)://</code> opens an external site.
          </p>
        </Card>
        <Card title="What we do — feature words">
          <p className="a-hint">
            The four numbered words under the paragraph (Understanding, Practical, Creative,
            Reliable). Add, edit or remove them freely.
          </p>
          {approachWords.map((word, index) => (
            <div key={index} className="a-item-group">
              <div className="a-home-two">
                <label className="a-field">
                  <span>Number</span>
                  <input
                    value={word.number}
                    onChange={(e) => updateApproachWord(index, 'number', e.target.value)}
                    placeholder="01"
                  />
                </label>
                <label className="a-field">
                  <span>Label</span>
                  <input
                    value={word.label}
                    onChange={(e) => updateApproachWord(index, 'label', e.target.value)}
                    placeholder="Understanding"
                  />
                </label>
              </div>
              <button
                className="a-btn a-btn-sm a-btn-danger-ghost"
                onClick={() => removeApproachWord(index)}
                disabled={savingApproach}
              >
                <i className="bi bi-trash" /> Remove this word
              </button>
            </div>
          ))}
          <button className="a-btn a-btn-sm a-btn-ghost" onClick={addApproachWord} disabled={savingApproach}>
            <i className="bi bi-plus-lg" /> Add feature word
          </button>
        </Card>
        <Card title="What we do — images">
          <div className="a-home-two">
            <div>
              <div className="a-home-subhead">
                <span>Large image</span>
                <small>Left of the composition.</small>
              </div>
              <div className="a-home-preview">
                {approachImages.interiorLarge ? (
                  <img src={approachImages.interiorLarge} alt="Large interior preview" />
                ) : (
                  <div className="a-home-preview-empty">No image.</div>
                )}
              </div>
              <label className="a-field">
                <span>Image URL</span>
                <input
                  value={
                    approachImages.interiorLarge.startsWith('data:')
                      ? '(uploaded image)'
                      : approachImages.interiorLarge
                  }
                  onChange={(e) => setApproachImages((prev) => ({ ...prev, interiorLarge: e.target.value }))}
                  placeholder="https://…"
                />
              </label>
              <label className="a-file-btn">
                <input
                  type="file"
                  accept="image/*"
                  disabled={savingApproach}
                  onChange={(e) => onApproachImageUpload('interiorLarge')(e.target.files?.[0])}
                />
                Upload image
              </label>
            </div>
            <div>
              <div className="a-home-subhead">
                <span>Small image</span>
                <small>Right of the composition.</small>
              </div>
              <div className="a-home-preview">
                {approachImages.interiorSmall ? (
                  <img src={approachImages.interiorSmall} alt="Small interior preview" />
                ) : (
                  <div className="a-home-preview-empty">No image.</div>
                )}
              </div>
              <label className="a-field">
                <span>Image URL</span>
                <input
                  value={
                    approachImages.interiorSmall.startsWith('data:')
                      ? '(uploaded image)'
                      : approachImages.interiorSmall
                  }
                  onChange={(e) => setApproachImages((prev) => ({ ...prev, interiorSmall: e.target.value }))}
                  placeholder="https://…"
                />
              </label>
              <label className="a-file-btn">
                <input
                  type="file"
                  accept="image/*"
                  disabled={savingApproach}
                  onChange={(e) => onApproachImageUpload('interiorSmall')(e.target.files?.[0])}
                />
                Upload image
              </label>
            </div>
          </div>
          <p className="a-hint a-home-hint">
            Paste an image URL or upload a file (up to 4MB). Saved into the same website images set
            used by the public section, without touching the hero or final CTA images.
          </p>
        </Card>
      </div>
    </div>
  )
}
