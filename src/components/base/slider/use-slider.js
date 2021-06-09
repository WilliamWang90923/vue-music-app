import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

import { onMounted, onUnmounted, ref } from 'vue'

BScroll.use(Slide)

export default function useSlider(wrapperRef) {
    const slider = ref(null)
    const currentPageIndex = ref(0)

    console.log('wrapperRef', wrapperRef)

    onMounted(() => {
        console.log('wrapperRef.value', wrapperRef.value)
        const sliderVal = slider.value = new BScroll(wrapperRef.value, {

            click: true,
            scrollX: true,
            scrollY: false,
            momentum: false,
            bounce: false,
            probeType: 2,
            slide: true
        })
        sliderVal.on('slideWillChange', (page) => {
            currentPageIndex.value = page.pageX
        })
    })

    onUnmounted(() => {
        slider.value.destroy()
    })

    return {
        slider,
        currentPageIndex
    }
}