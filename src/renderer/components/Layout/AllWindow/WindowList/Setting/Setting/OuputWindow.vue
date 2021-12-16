<template>
  <div class="output-window">
    <div class="flex-box between">
      <!-- <div class="window-container mg-r output-left">
        <div class="container-title">
          输出通道列表
        </div>
        <div class="container  flex-box column">
          <div class="flex-box between">
            <div class="flex-label">
              输出通道数量
            </div>
            <el-input size="mini" class="flex-1"></el-input>
          </div>
          <div class="list-container mg-t"></div>
        </div>
      </div> -->
      <div class="window-container flex-1 output-right">
        <div class="container-title">
          输出通道列表
        </div>
        <div class="output-back" ref="output-back">
          <div class="output-item" v-for="(item, index) in outputList" :style="item" :key="item.id">
            <span class="screen-title">{{ item.id }}</span>
            <div class="output-select">
              <el-select class="w-100" v-model="outpuSelect[index]" @change="setOutput(index, $event)">
                <el-option v-for="list in outputSelectList" :key="list.id" :value="list.id" :label="list.label"></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { popMixin } from '@/api/mixins/popwindow-mixin'
import { popSpliceWindowMixin } from '@/api/mixins/popwindow-mixin.js'
import { navMixin } from '@/api/mixins/nav-mixin.js'
export default {
  mixins: [popMixin, popSpliceWindowMixin, navMixin],
  data () {
    return {
      outputList: [],
      outputSelectList: [],
      outpuSelect: []
    }
  },
  created () {
  },
  mounted () {
    this._initList()
  },
  watch: {
    currSelectGroupObj: function (newVal) {
      if (newVal) {
        this._initList()
      }
    }
  },
  methods: {
    _initList () { // 获取当前分组 根据当前分组几 * 几来绘制图形, 并且生成输出通道列表
      const { screenRow, screenColumn, screenList } = this.currSelectGroupObj
      const backObj = this.$refs['output-back']
      this.outpuSelect = JSON.parse(JSON.stringify(screenList))
      this.outputList = []
      this.outputSelectList = []
      screenList.forEach(item => {
        this.outputSelectList.push({
          id: item,
          label: `输出通道${item}`
        })
      })
      for (let i = 0; i < screenRow; i++) {
        for (let j = 0; j < screenColumn; j++) {
          const currIndex = i * screenColumn + j // 计算当前索引
          const width = backObj.offsetWidth / screenColumn
          const height = backObj.offsetHeight / screenRow
          this.outputSelectList[currIndex]['screenRow'] = i
          this.outputSelectList[currIndex]['screenColumn'] = j
          this.outputList.push({
            id: currIndex + 1,
            width: `${width}px`,
            height: `${height}px`,
            left: `${j * width}px`,
            top: `${i * height}px`,
            screenRow: i,
            screenColumn: j
          })
        }
      }
      this.outputSelectList.sort((a, b) => a.id - b.id)
    },
    setOutput (index, value) {
      const { groupIdx, screenList, screenRow, screenColumn } = this.currSelectGroupObj
      const oldRowAndCol = this.outputSelectList.filter(item => item.id === screenList[index])[0]
      const newRowAndCol = this.outputSelectList.filter(item => item.id === value)[0]
      const sendData = {
        guihead: 'setOutChMapping',
        groupIdx,
        screenRow,
        screenColumn,
        screenSelA: {
          layoutRow: oldRowAndCol.screenRow,
          layoutCol: oldRowAndCol.screenColumn
        },
        screenSelB: {
          layoutRow: newRowAndCol.screenRow,
          layoutCol: newRowAndCol.screenColumn
        }
      }
      this.$request(sendData).then(res => {
        setTimeout(() => {
          this.$store.dispatch('getDeviceListAndgetGroupList')
        }, 500)
      })
    }
  }
}
</script>

<style lang="scss">
.output-window {
  width: 700px;
  .output-left {
    width: 150px;
    height:420px;
    .list-container {
      height: 350px;
      background: #fff;
      border: 1px solid #000;
      width: 100%;
    }
  }
  .output-right {
    height:420px;
    .output-back {
      width: 100%;
      height: 100%;
      border: 1px solid #000;
      background: #fff;
      position: relative;
      .output-item {
        border: 1px solid #000;
        position: absolute;
        span {
          padding: 5px;
        }
        .output-select {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 0;
          right: 0;
        }
      }
    }
  }
}
</style>
