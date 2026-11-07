import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowDown,
  ArrowUpRight,
  BusFront,
  ChevronDown,
  CircleDot,
  Expand,
  Gauge,
  Minus,
  Move3d,
  Plus,
  RotateCcw,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import BusScene from './components/BusScene'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const NAV_ITEMS = [
  { id: 'hero', label: 'Overview' },
  { id: 'exterior', label: 'Exterior' },
  { id: 'interior', label: 'Cabin' },
  { id: 'specifications', label: 'Specs' },
  { id: 'gallery', label: 'Gallery' },
]

const GALLERY_VIEWS = [
  { label: 'Departure', sub: 'FRONT  /  000°', angle: 0 },
  { label: 'Roadside', sub: 'FRONT THREE-QUARTER  /  045°', angle: Math.PI / 4 },
  { label: 'Long haul', sub: 'SIDE  /  090°', angle: Math.PI / 2 },
  { label: 'Last stop', sub: 'REAR  /  180°', angle: Math.PI },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function App() {
  const rootRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ active: false, lastX: 0 })
  const touchPointsRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchDistanceRef = useRef<number | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [activeSection, setActiveSection] = useState('hero')
  const [showHotspots, setShowHotspots] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const rotation = scrollProgress * Math.PI * 2 + dragOffset

  useEffect(() => {
    const updateScroll = () => {
      const hero = heroRef.current
      if (!hero) return
      const travel = Math.max(hero.offsetHeight - window.innerHeight, 1)
      const progress = clamp((window.scrollY - hero.offsetTop) / travel, 0, 1)
      setScrollProgress(progress)
    }
    updateScroll()
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(updateScroll)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateScroll)
    }
  }, [])

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveSection(entry.target.id)),
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    )
    NAV_ITEMS.forEach(({ id }) => {
      const section = document.getElementById(id)
      if (section) sectionObserver.observe(section)
    })
    return () => sectionObserver.disconnect()
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.fromTo(element, { y: 34, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 86%', once: true },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      touchPointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (touchPointsRef.current.size === 2) {
        const points = [...touchPointsRef.current.values()]
        pinchDistanceRef.current = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
      }
    }
    dragRef.current = { active: true, lastX: event.clientX }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      touchPointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (touchPointsRef.current.size === 2) {
        const points = [...touchPointsRef.current.values()]
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
        if (pinchDistanceRef.current !== null) {
          setZoom((value) => clamp(value + (distance - pinchDistanceRef.current!) * 0.0025, 0.76, 1.42))
        }
        pinchDistanceRef.current = distance
        return
      }
    }
    if (!dragRef.current.active) return
    const delta = event.clientX - dragRef.current.lastX
    dragRef.current.lastX = event.clientX
    setDragOffset((current) => current + delta * 0.012)
  }

  const stopDrag = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event?.pointerType === 'touch') {
      touchPointsRef.current.delete(event.pointerId)
      if (touchPointsRef.current.size < 2) pinchDistanceRef.current = null
    }
    dragRef.current.active = false
  }

  const resetCamera = () => {
    setDragOffset(0)
    setZoom(1)
  }

  const setGalleryView = (angle: number) => setDragOffset(angle - scrollProgress * Math.PI * 2)

  const toggleFullscreen = async () => {
    if (!stageRef.current) return
    try {
      if (!document.fullscreenElement) await stageRef.current.requestFullscreen()
      else await document.exitFullscreen()
    } catch {
      setIsFullscreen(false)
    }
  }

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="app-shell" ref={rootRef}>
      <header className="site-header">
        <button className="brand-mark" onClick={() => scrollTo('hero')} aria-label="Back to TNSTC 360 hero">
          <span className="brand-glyph"><span /><span /><span /></span>
          <span><b>TNSTC</b><small>360° / MOVING LANDMARKS</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className={activeSection === item.id ? 'active' : ''} onClick={() => scrollTo(item.id)}>{item.label}</button>
          ))}
        </nav>
        <div className="header-meta"><span className="live-dot" /> Scroll to explore <span className="header-index">01—09</span></div>
      </header>

      <main>
        <section id="hero" ref={heroRef} className="hero-section">
          <div className="hero-sticky">
            <div className="hero-copy page-pad" data-reveal>
              <p className="eyebrow"><span>01</span> TAMIL NADU STATE TRANSPORT CORPORATION</p>
              <h1>THE ROAD<br /><em>REMEMBERS.</em></h1>
              <p className="hero-lede">A bus is never just a bus. It is a moving landmark, a familiar horizon, a thousand departures made visible.</p>
              <button className="scroll-cue" onClick={() => window.scrollTo({ top: window.innerHeight * 0.72, behavior: 'smooth' })}><ArrowDown size={15} /> <span>Turn it with the road</span></button>
            </div>

            <div
              ref={stageRef}
              className="hero-stage"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              onPointerLeave={stopDrag}
              aria-label="Interactive TNSTC 3D bus. Scroll the page or drag the bus to rotate."
            >
              <BusScene rotation={rotation} zoom={zoom} />
              <div className="stage-vignette" />
              <div className="stage-grid" />
              {showHotspots && <>
                <button className="hotspot hotspot-a" onClick={() => setGalleryView(Math.PI / 4)}><span>01</span><i /><b>Front beam</b></button>
                <button className="hotspot hotspot-b" onClick={() => setGalleryView(Math.PI / 2)}><span>02</span><i /><b>Passenger bay</b></button>
                <button className="hotspot hotspot-c" onClick={() => setGalleryView(Math.PI)}><span>03</span><i /><b>Rear service</b></button>
              </>}
              <div className="stage-corner stage-corner-tl"><ScanLine size={14} /><span>LIVE MODEL / GLB</span></div>
              <div className="stage-corner stage-corner-br"><span>DRAG TO OFFSET</span><Move3d size={14} /></div>
              <div className="model-controls" onPointerDown={(event) => event.stopPropagation()}>
                <button onClick={() => setZoom((value) => clamp(value + 0.12, 0.76, 1.42))} aria-label="Zoom in"><Plus size={16} /></button>
                <button onClick={() => setZoom((value) => clamp(value - 0.12, 0.76, 1.42))} aria-label="Zoom out"><Minus size={16} /></button>
                <button onClick={resetCamera} aria-label="Reset camera"><RotateCcw size={15} /></button>
                <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}><Expand size={15} /></button>
              </div>
              <div className="rotation-readout"><strong>{String(Math.round(((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * 180 / Math.PI)).padStart(3, '0')}°</strong><span>SCROLL-LOCKED ROTATION</span></div>
            </div>

            <div className="hero-bottom page-pad">
              <div className="scroll-progress"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
              <div className="hero-bottom-meta"><span>SCROLL PROGRESS</span><b>{Math.round(scrollProgress * 100)}%</b><span>FRAME 000 / 360</span></div>
            </div>
          </div>
        </section>

        <section id="exterior" className="content-section exterior-section page-pad">
          <div className="section-index" data-reveal><span>02</span><i /> EXTERIOR / THE LIVERY</div>
          <div className="split-heading" data-reveal>
            <h2>Made for<br /><em>the long view.</em></h2>
            <div><p className="section-lede">The familiar cream and saffron silhouette, redrawn as a study in movement. Every surface earns its place: shade, signal, shelter.</p><a className="text-link" href="#front-design">Read the front design <ArrowUpRight size={15} /></a></div>
          </div>
          <div className="exterior-feature" data-reveal>
            <div className="blueprint-visual"><div className="blueprint-bus"><span className="bp-window bp-window-1" /><span className="bp-window bp-window-2" /><span className="bp-window bp-window-3" /><span className="bp-stripe" /><span className="bp-wheel bp-wheel-1" /><span className="bp-wheel bp-wheel-2" /></div><span className="blueprint-label label-top">8.9 M / BODY LENGTH</span><span className="blueprint-label label-side">TNSTC / ROUTE MEMORY</span></div>
            <div className="feature-note"><span className="note-number">A</span><h3>Visible from<br /><em>the next stop.</em></h3><p>Long beltlines, high-set glazing and a deliberate roof cap make the bus legible before it arrives. That is design doing public work.</p><div className="micro-stats"><span><b>07</b> WINDOW BAYS</span><span><b>02</b> ENTRY DOORS</span></div></div>
          </div>
          <div className="stat-ribbon" data-reveal><div><span>LINEAGE</span><b>Govt. intercity</b></div><div><span>LIVERY</span><b>Cream / saffron / teal</b></div><div><span>SCENE</span><b>Sunrise to last stop</b></div></div>
        </section>

        <section id="front-design" className="content-section dark-section page-pad">
          <div className="section-index" data-reveal><span>03</span><i /> FRONT DESIGN / THE ARRIVAL</div>
          <div className="front-layout">
            <div className="front-copy" data-reveal><p className="eyebrow">A CLEAR SIGNAL</p><h2>The face<br />of <em>arrival.</em></h2><p className="section-lede">A wide windshield for the driver’s horizon. An amber destination board for yours. This is a front built to be read at speed.</p><div className="detail-list"><div><span>01</span><b>Destination board</b><p>Warm amber, high contrast and legible through dust, dawn and distance.</p></div><div><span>02</span><b>Beam signature</b><p>Twin headlamps sit below the glass line, giving the bus a calm, grounded stance.</p></div><div><span>03</span><b>Mirror span</b><p>Extended housings widen the driver’s awareness without adding visual noise.</p></div></div></div>
            <div className="front-diagram" data-reveal><div className="diagram-bus-front"><div className="diagram-board">TNSTC · CHENNAI</div><div className="diagram-windscreen"><span /><span /></div><div className="diagram-lamps"><i /><i /></div><div className="diagram-grille"><i /><i /><i /><i /></div></div><span className="diagram-line line-a" /><span className="diagram-callout callout-a">DESTINATION / AMBER</span><span className="diagram-line line-b" /><span className="diagram-callout callout-b">TWIN BEAM / WIDE SET</span></div>
          </div>
        </section>

        <section id="side-design" className="content-section side-section page-pad">
          <div className="section-index" data-reveal><span>04</span><i /> SIDE DESIGN / THE RHYTHM</div>
          <div className="split-heading" data-reveal><h2>Windows<br /><em>into the day.</em></h2><p className="section-lede">Six repeating bays make a moving rhythm. Door, window, pillar, reflection: the side view is a cadence passengers know by heart.</p></div>
          <div className="side-rail" data-reveal><div className="rail-bus"><span className="rail-roof" /><span className="rail-window w1" /><span className="rail-window w2" /><span className="rail-window w3" /><span className="rail-window w4" /><span className="rail-door" /><span className="rail-wheel rw1" /><span className="rail-wheel rw2" /></div><div className="rail-labels"><span><i>01</i> SHELTER</span><span><i>02</i> RHYTHM</span><span><i>03</i> ACCESS</span><span><i>04</i> SIGNAL</span></div></div>
          <div className="quote-block" data-reveal><Sparkles size={18} /><blockquote>“Every window carries a different version of Tamil Nadu.”</blockquote><cite>— A passenger’s point of view</cite></div>
        </section>

        <section id="rear-design" className="content-section dark-section rear-section page-pad">
          <div className="section-index" data-reveal><span>05</span><i /> REAR DESIGN / THE RETURN</div>
          <div className="rear-layout"><div data-reveal><p className="eyebrow">SERVICE SIDE / 180°</p><h2>Built to<br /><em>come back.</em></h2><p className="section-lede">The rear is all closure and continuity: engine access, tail lamps and a final stripe that holds the silhouette together.</p><button className="outline-button" onClick={() => setGalleryView(Math.PI)}><CircleDot size={15} /> View rear profile <ArrowUpRight size={15} /></button></div><div className="rear-card" data-reveal><div className="rear-grille"><i /><i /><i /><i /><i /></div><div className="rear-tail"><span /><span /></div><div className="rear-caption"><b>REAR SERVICE</b><span>ENGINE ACCESS / VISIBILITY / RETURN</span></div></div></div>
        </section>

        <section id="interior" className="content-section interior-section page-pad">
          <div className="section-index" data-reveal><span>06</span><i /> INTERIOR / THE SHARED SPACE</div>
          <div className="split-heading" data-reveal><h2>Inside, a<br /><em>moving room.</em></h2><p className="section-lede">Seat after seat, the bus converts distance into company. The aisle is the spine; every stop is a small change in perspective.</p></div>
          <div className="interior-layout"><div className="cabin-perspective" data-reveal><div className="cabin-ceiling" /><div className="cabin-window left" /><div className="cabin-window right" /><div className="cabin-aisle" /><div className="seat-row sr1"><i /><i /></div><div className="seat-row sr2"><i /><i /></div><div className="seat-row sr3"><i /><i /></div><div className="cabin-destination">NEXT STOP<br /><b>EVERYWHERE</b></div></div><div className="cabin-notes" data-reveal><div><span>CAPACITY / 42</span><h3>Plenty of<br /><em>room for stories.</em></h3></div><p>Warm seat tones, cool window light, and a clear aisle keep the cabin human. A familiar interior can still be carefully considered.</p><div className="vertical-rule" /><div className="cabin-feature-list"><span><b>01</b> CLEAR AISLE</span><span><b>02</b> HIGH GLAZING</span><span><b>03</b> CALM SIGNALS</span></div></div></div>
        </section>

        <section id="cockpit" className="content-section cockpit-section dark-section page-pad">
          <div className="section-index" data-reveal><span>07</span><i /> DRIVER COCKPIT / THE VIEW FORWARD</div>
          <div className="cockpit-layout"><div className="cockpit-display" data-reveal><div className="steering-wheel"><span /><i /><i /><i /></div><div className="dashboard-line dl1" /><div className="dashboard-line dl2" /><div className="dashboard-screen">TNSTC<br /><small>READY / 05:42</small></div><div className="dashboard-switches"><i /><i /><i /><i /><i /></div></div><div className="cockpit-copy" data-reveal><p className="eyebrow">THE HUMAN INTERFACE</p><h2>One seat.<br /><em>Every horizon.</em></h2><p className="section-lede">Before a route becomes a memory, someone holds the line. The cockpit is a compact vocabulary of control, visibility and trust.</p><div className="cockpit-stat"><Gauge size={17} /><span><b>05:42</b><small>FIRST DEPARTURE / READY STATE</small></span></div></div></div>
        </section>

        <section id="specifications" className="content-section spec-section page-pad">
          <div className="section-index" data-reveal><span>08</span><i /> SPECIFICATIONS / THE NUMBERS</div>
          <div className="spec-heading" data-reveal><h2>Quietly<br /><em>capable.</em></h2><p className="section-lede">A public vehicle is a balance of reach, resilience and everyday grace. Here is the silhouette, reduced to the numbers that make it move.</p></div>
          <div className="spec-table" data-reveal><div><span>BODY LENGTH</span><b>8.9 m</b><small>FULL-SIZE INTERCITY</small></div><div><span>BODY WIDTH</span><b>2.35 m</b><small>HIGH-GLAZING PROFILE</small></div><div><span>SEATING</span><b>42</b><small>PASSENGER CAPACITY</small></div><div><span>WHEELBASE</span><b>3.0 m</b><small>STEADY / GROUNDED</small></div><div><span>TURNING CIRCLE</span><b>8.4 m</b><small>DEPOT-READY AGILITY</small></div><div><span>IDENTITY</span><b>TNSTC</b><small>PUBLIC / FAMILIAR / TRUE</small></div></div>
          <div className="spec-foot"><span>MODEL FILE / TNSTC-BUS.GLB</span><span>LIGHTING / PBR STUDY</span><span>ROTATION / SCROLL-SYNCED</span></div>
        </section>

        <section id="gallery" className="content-section gallery-section dark-section page-pad">
          <div className="section-index" data-reveal><span>09</span><i /> GALLERY / CHOOSE YOUR VIEW</div>
          <div className="split-heading" data-reveal><h2>Keep<br /><em>looking.</em></h2><p className="section-lede">The bus holds its shape from every angle. Use a view below as a starting point, then take the wheel yourself.</p></div>
          <div className="gallery-grid" data-reveal>{GALLERY_VIEWS.map((view, index) => <button key={view.label} className="gallery-card" onClick={() => setGalleryView(view.angle)}><span className={`gallery-art gallery-art-${index + 1}`}><i /><i /><i /></span><span className="gallery-card-copy"><b>{view.label}</b><small>{view.sub}</small></span><ArrowUpRight size={16} /></button>)}</div>
          <div className="final-cta" data-reveal><span className="final-mark"><BusFront size={22} /></span><p>Public transport,<br /><em>made visible.</em></p><button className="solid-button" onClick={() => scrollTo('hero')}>Restart the journey <ChevronDown size={15} /></button></div>
        </section>
      </main>

      <footer className="site-footer page-pad"><span>© 2026 TNSTC 360°</span><span>DESIGNED FOR THE ROAD AHEAD</span><button onClick={() => setShowHotspots((value) => !value)}>{showHotspots ? 'Hide' : 'Show'} hotspots</button></footer>
    </div>
  )
}

export default App
