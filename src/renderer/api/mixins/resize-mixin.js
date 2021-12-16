export const resizeMixin = {
  created () {
    this.setScreenSize()
  },
  methods: {
    setScreenSize () {
      const body = document.getElementsByTagName('body')[0]
      body.style.width = `${window.innerWidth}px`
      body.style.height = `${window.innerHeight}px`
    }
  }
}
