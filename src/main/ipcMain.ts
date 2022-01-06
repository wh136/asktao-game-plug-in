import { ipcMain } from 'electron'
import robot, { Bitmap } from 'robotjs'
import Jimp from 'jimp'
import path from 'path'
import GameWindowControl from '../utils/gameWindowControll'

// 将截图文件转换为png图片
function screenCaptureToFile2(robotScreenPic: Bitmap, path: string) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Jimp(robotScreenPic.width, robotScreenPic.height)
      let pos = 0
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        image.bitmap.data[idx + 2] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 1] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 0] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 3] = robotScreenPic.image.readUInt8(pos++)
      })
      image.write(path, resolve)
    } catch (e) {
      console.error(e)
      reject(e)
    }
  })
}

export default function init() {
  ipcMain.on('get-mouse-pos', (event, pid) => {
    const instance = new GameWindowControl(pid)

    const { left, top } = instance.getDimensions()
    const { x, y } = robot.getMousePos()

    event.reply('get-mouse-pos', { x: x - left, y: y - top })
  })

  ipcMain.on('move-mouse', (_event, { x, y }) => {
    robot.moveMouseSmooth(x, y)
  })

  ipcMain.on('get-image', async (_event, { x, y, fileNmae }) => {
    robot.moveMouseSmooth(x, y)
    const bitmap = robot.screen.capture(x, y, 1920, 40)

    await screenCaptureToFile2(bitmap, path.join(__dirname, `../assets/${fileNmae}.png`))
  })

  // subWindow.loadFile(path.join(__dirname, './test.html'))
}
