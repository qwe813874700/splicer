<template>
  <div class="loading-motal w-100 h-100 position-fixed start-0 top-0">
    <svg class="position-absolute top-50 start-50" width="48px" height="60px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50" xml:space="preserve">
      <rect x="0" y="9.22656" width="4" height="12.5469" fill="#b8d7ff">
        <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
        <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
      </rect>
      <rect x="10" y="5.22656" width="4" height="20.5469" fill="#b8d7ff">
        <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
        <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
      </rect>
      <rect x="20" y="8.77344" width="4" height="13.4531" fill="#b8d7ff">
        <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
        <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
      </rect>
    </svg>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  }
}
</script>

<style lang="scss">
.loading-motal {
  z-index: 999;
  svg {
    transform: translate(-50%, -50%);
  }
}
</style>
