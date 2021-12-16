/**
 * @description 存放一些公用对象
 * @author ziming
 * @date 2021-8-27
 */

export const popWindowList = (() => {
  return [
    {
      id: 0,
      name: 'CreateWindow',
      title: '创建窗口'
    },
    {
      id: 1,
      name: 'PropertyWindow',
      title: '窗口属性'
    },
    {
      id: 2,
      name: 'RateWindow',
      title: '帧率信息'
    },
    {
      id: 3,
      name: 'ScreenControlWindow',
      title: '帧率信息'
    },
    {
      id: 4,
      name: 'ReadSceneWindow',
      title: '调取场景'
    },
    {
      id: 5,
      name: 'SaveSceneWindow',
      title: '保存场景'
    },
    {
      id: 6,
      name: 'ManageSceneWindow',
      title: '场景管理'
    },
    {
      id: 7,
      name: 'PopSpliceWindow',
      title: '拼接设置'
    },
    {
      id: 8,
      name: 'EncoderWindow',
      title: '编码器'
    },
    {
      id: 9,
      name: 'DecoderWindow',
      title: '解码器'
    },
    {
      id: 10,
      name: 'OuputWindow',
      title: '屏幕输出设置'
    },
    {
      id: 11,
      name: 'ScreenBackWindow',
      title: '大屏背景颜色设置'
    },
    {
      id: 12,
      name: 'DeviceActivateWindow',
      title: '许可设置'
    },
    {
      id: 13,
      name: 'SenceLoopWindow',
      title: '场景轮询',
      cancelClose: true
    }
  ]
})()

export const spliceTypeList = (() => {
  return [
    {
      id: 0,
      name: '大屏拼接'
    },
    {
      id: 1,
      name: 'LED拼接'
    }
  ]
})()

export const baudrateList = (() => {
  return [
    {
      id: 1,
      label: 115200
    },
    {
      id: 2,
      label: 57600
    },
    {
      id: 3,
      label: 38400
    },
    {
      id: 4,
      label: 19200
    },
    {
      id: 5,
      label: 9600
    },
    {
      id: 6,
      label: 4800
    },
    {
      id: 7,
      label: 2400
    },
    {
      id: 8,
      label: 1200
    }
  ]
})()

export const resolutionList = (() => {
  return [
    {
      id: 1,
      width: 640,
      height: 480,
      freshList: [
        {
          id: 0,
          hActive: 640,
          hBlank: 144,
          hFrontPorch: 8,
          hBackPorch: 40,
          hSyncWidth: 96,
          hTotal: 800,
          hSyncPolar: 0,
          hBorder: 0,
          vActive: 480,
          vBlank: 29,
          vFrontPorch: 2,
          vBackPorch: 25,
          vSyncWidth: 2,
          vTotal: 525,
          vSyncPolar: 0,
          vBorder: 0,
          refresh: 60,
          pixelClk: 25200000,
          hScanRate: 31500,
          videoFormat: 0
        }
      ]
    },
    {
      id: 2,
      width: 800,
      height: 600,
      freshList: [
        {
          id: 0,
          hActive: 800,
          hBlank: 256,
          hFrontPorch: 40,
          hBackPorch: 88,
          hSyncWidth: 128,
          hTotal: 1056,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 600,
          vBlank: 28,
          vFrontPorch: 1,
          vBackPorch: 23,
          vSyncWidth: 4,
          vTotal: 628,
          vSyncPolar: 1,
          vBorder: 0,
          refresh: 60,
          pixelClk: 39790080,
          hScanRate: 37680,
          videoFormat: 1
        }
      ]
    },
    {
      id: 3,
      width: 1024,
      height: 768,
      freshList: [
        {
          id: 0,
          hActive: 1024,
          hBlank: 320,
          hFrontPorch: 24,
          hBackPorch: 160,
          hSyncWidth: 136,
          hTotal: 1344,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 768,
          vBlank: 38,
          vFrontPorch: 3,
          vBackPorch: 29,
          vSyncWidth: 6,
          vTotal: 806,
          vSyncPolar: 1,
          vBorder: 0,
          refresh: 60,
          pixelClk: 64995840,
          hScanRate: 48360,
          videoFormat: 2
        }
      ]
    },
    {
      id: 4,
      width: 1280,
      height: 720,
      freshList: [
        {
          id: 0,
          hActive: 1280,
          hBlank: 370,
          hFrontPorch: 110,
          hBackPorch: 220,
          hSyncWidth: 40,
          hTotal: 1650,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 720,
          vBlank: 30,
          vFrontPorch: 5,
          vBackPorch: 20,
          vSyncWidth: 5,
          vTotal: 750,
          vSyncPolar: 1,
          vBorder: 0,
          refresh: 60,
          pixelClk: 74250000,
          hScanRate: 45000,
          videoFormat: 3
        },
        {
          id: 1,
          hActive: 1280,
          hBlank: 700,
          hFrontPorch: 440,
          hBackPorch: 220,
          hSyncWidth: 40,
          hTotal: 1980,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 720,
          vBlank: 30,
          vFrontPorch: 5,
          vBackPorch: 20,
          vSyncWidth: 5,
          vTotal: 750,
          vSyncPolar: 1,
          vBorder: 0,
          refresh: 60,
          pixelClk: 74250000,
          hScanRate: 45000,
          videoFormat: 11
        }
      ]
    },
    {
      id: 5,
      width: 1280,
      height: 800,
      freshList: [
        {
          id: 0,
          hActive: 1280,
          hBlank: 160,
          hFrontPorch: 48,
          hBackPorch: 80,
          hSyncWidth: 32,
          hTotal: 1440,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 800,
          vBlank: 23,
          vFrontPorch: 3,
          vBackPorch: 14,
          vSyncWidth: 6,
          vTotal: 823,
          vSyncPolar: 0,
          vBorder: 0,
          refresh: 60,
          pixelClk: 71107200,
          hScanRate: 49380,
          videoFormat: 4
        }
      ]
    },
    {
      id: 6,
      width: 1280,
      height: 960,
      freshList: [
        {
          id: 0,
          hActive: 1280,
          hBlank: 520,
          hFrontPorch: 96,
          hBackPorch: 312,
          hSyncWidth: 112,
          hTotal: 1800,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 960,
          vBlank: 40,
          vFrontPorch: 1,
          vBackPorch: 3,
          vSyncWidth: 36,
          vTotal: 1000,
          vSyncPolar: 1,
          vBorder: 0,
          refresh: 60,
          pixelClk: 108000000,
          hScanRate: 60000,
          videoFormat: 5
        }
      ]
    },
    {
      id: 7,
      width: 1280,
      height: 1024,
      freshList: [
        {
          id: 0,
          hActive: 1280,
          hBlank: 408,
          hFrontPorch: 48,
          hBackPorch: 248,
          hSyncWidth: 112,
          hTotal: 1688,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 1024,
          vBlank: 42,
          vFrontPorch: 1,
          vBackPorch: 38,
          vSyncWidth: 3,
          vTotal: 1066,
          vSyncPolar: 1,
          vBorder: 0,
          refresh: 60,
          pixelClk: 107964480,
          hScanRate: 63960,
          videoFormat: 6
        }
      ]
    },
    {
      id: 8,
      width: 1360,
      height: 768,
      freshList: [
        {
          id: 0,
          hActive: 1360,
          hBlank: 432,
          hFrontPorch: 64,
          hBackPorch: 112,
          hSyncWidth: 256,
          hTotal: 1792,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 768,
          vBlank: 27,
          vFrontPorch: 3,
          vBackPorch: 18,
          vSyncWidth: 6,
          vTotal: 795,
          vSyncPolar: 1,
          vBorder: 0,
          refresh: 60,
          pixelClk: 85478400,
          hScanRate: 47700,
          videoFormat: 7
        }
      ]
    },
    {
      id: 9,
      width: 1920,
      height: 1080,
      freshList: [
        {
          id: 0,
          hActive: 1920,
          hBlank: 280,
          hFrontPorch: 88,
          hBackPorch: 148,
          hSyncWidth: 44,
          hTotal: 2200,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 1080,
          vBlank: 45,
          vFrontPorch: 4,
          vBackPorch: 36,
          vSyncWidth: 5,
          vTotal: 1125,
          vSyncPolar: 1,
          vBorder: 0,
          refresh: 60,
          pixelClk: 148500000,
          hScanRate: 67500,
          videoFormat: 9
        },
        {
          id: 1,
          hActive: 1920,
          hBlank: 720,
          hFrontPorch: 528,
          hBackPorch: 148,
          hSyncWidth: 44,
          hTotal: 2640,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 1080,
          vBlank: 45,
          vFrontPorch: 4,
          vBackPorch: 36,
          vSyncWidth: 5,
          vTotal: 1125,
          vSyncPolar: 1,
          vBorder: 0,
          refresh: 50,
          pixelClk: 148500000,
          hScanRate: 56250,
          videoFormat: 10
        },
        {
          id: 2,
          hActive: 1920,
          hBlank: 280,
          hFrontPorch: 88,
          hBackPorch: 148,
          hSyncWidth: 44,
          hTotal: 2200,
          hSyncPolar: 1,
          hBorder: 0,
          vActive: 1080,
          vBlank: 45,
          vFrontPorch: 4,
          vBackPorch: 36,
          vSyncWidth: 5,
          vTotal: 1125,
          vSyncPolar: 1,
          vBorder: 0,
          refresh: 30,
          pixelClk: 74250000,
          hScanRate: 33750,
          videoFormat: 11
        }
      ]
    }
  ]
})()
