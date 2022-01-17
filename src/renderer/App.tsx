import { createContext, useContext, useEffect, useState } from 'react'
import './App.css'
import Pages from './pages'
import { requestByGet } from '../utils/http'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'

export const AppContext = createContext({
  ipcRenderer: window.electron.ipcRenderer,
})

const Hello = () => {
  const { ipcRenderer } = useContext(AppContext)
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(false)

  useEffect(() => {
    ipcRenderer.on('get-mouse-pos', function (pos: { x: number; y: number }) {
      console.log('get-mouse-pos args: ', pos)
    })

    ipcRenderer.on('get-process', function (processes: string[]) {
      console.log('get-process data: ', processes)
    })
  }, [])

  useEffect(() => {
    let interval: number
    if (isTimerStarted) {
      interval = window.setInterval(() => {
        window.electron.ipcRenderer.send('get-mouse-pos', 15896)
      }, 3000)
    }

    return () => {
      window.clearInterval(interval)
    }
  }, [isTimerStarted])

  const handleMoveMouseBtnClick = () => {
    ipcRenderer.send('move-mouse', { x: 1228, y: 712 })
  }

  const handleToggleTimerBtnClick = () => {
    setIsTimerStarted(!isTimerStarted)
  }

  const handleGetImageBtnClick = async () => {
    ipcRenderer.send('get-image', { x: 6, y: 91 })
  }

  const handleGetProcessBtnClick = () => {
    ipcRenderer.send('get-process')
  }

  const handleGetGameServerGroupBtnClick = async () => {
    const data = await requestByGet('/getGameServerGroup')

    console.log('data: ', data)
  }

  return (
    <div>
      <button type="button" onClick={handleMoveMouseBtnClick}>
        点击移动
      </button>
      <button type="button" onClick={handleToggleTimerBtnClick}>
        切换定时器
      </button>
      <button type="button" onClick={handleGetImageBtnClick}>
        获取截图
      </button>
      <button type="button" onClick={handleGetProcessBtnClick}>
        获取进程
      </button>
      <button type="button" onClick={handleGetGameServerGroupBtnClick}>
        获取服务器区组
      </button>
    </div>
  )
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Pages />
    </ConfigProvider>
  )
}
