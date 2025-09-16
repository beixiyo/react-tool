import { ScrollTrigger } from '@jl-org/tool'
import React, { useEffect, useRef } from 'react'

interface ParallaxSectionProps {
  imageUrl: string
  text: string
}

const ParallaxSection: React.FC<ParallaxSectionProps & { scrubMode?: boolean | number }> = ({ imageUrl, text, scrubMode = true }) => {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current)
      return

    /** 获取视口高度 */
    const height = window.innerHeight

    const trigger = new ScrollTrigger({
      trigger: sectionRef.current,
      /** 修改触发位置，当元素进入视口时开始 */
      start: ['top', 'bottom'],
      /** 当元素完全离开视口时结束 */
      end: ['bottom', 'top'],
      /** 使用传入的 scrub 模式 */
      scrub: scrubMode,
      targets: sectionRef.current,
      smoothScroll: true,
      props: [
        { backgroundPositionY: -height / 2 },
        { backgroundPositionY: height / 2 },
      ],
    })

    return () => {
      trigger.destroy()
    }
  }, [scrubMode])

  return (
    <div
      ref={ sectionRef }
      className="relative h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={ {
        backgroundImage: `url(${imageUrl})`,
      } }
    >
      <div style={ {
        color: 'white',
        fontSize: '36px',
        textAlign: 'center',
        lineHeight: '100vh', // 添加与 GSAP 示例一致的行高
      } }>
        { text }
      </div>

      <div className="absolute bottom-2 right-2 rounded-sm bg-black/50 px-2 py-1 text-white">
        scrub:
        {' '}
        { scrubMode === true
          ? 'true'
          : scrubMode === false
            ? 'false'
            : scrubMode }
      </div>
    </div>
  )
}

const ParallaxPage: React.FC = () => {
  const sections = [
    {
      imageUrl: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      text: '展示文字1',
      scrubMode: true,
    },
    {
      imageUrl: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      text: '展示文字2',
      scrubMode: true,
    },
    {
      imageUrl: 'https://images.pexels.com/photos/1572386/pexels-photo-1572386.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      text: '展示文字3',
      scrubMode: true,
    },
  ]

  return (
    <>
      { sections.map((section, index) => (
        <ParallaxSection
          key={ index }
          imageUrl={ section.imageUrl }
          text={ section.text }
          scrubMode={ section.scrubMode }
        />
      )) }
    </>
  )
}

export default ParallaxPage
