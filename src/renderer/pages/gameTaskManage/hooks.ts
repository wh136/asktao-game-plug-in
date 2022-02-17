import { GameTask, GameTaskList, GameTaskPlanList } from 'constants/types'
import { useCallback, useEffect, useState } from 'react'
import { requestByGet, requestByPost } from 'utils/http'

export function useGameTaskList() {
  const [gameTaskList, setGameTaskList] = useState<GameTaskList>([])

  const getGameTaskList = useCallback(async () => {
    try {
      const gameTaskList = await requestByGet<GameTaskList>('/getGameTaskList')

      setGameTaskList(gameTaskList)
    } catch (error) {
      console.log('useGameTaskList error: ', error)
    }
  }, [])

  useEffect(() => {
    getGameTaskList()
  }, [])

  return { gameTaskList, getGameTaskList }
}

export function useAddGameTask() {
  const addGameTask = useCallback(async (gameTask: GameTask) => {
    try {
      await requestByPost('/addGameTask', gameTask)
    } catch (error) {
      console.log('useAddGameTask error: ', error)
    }
  }, [])

  return (gamePoint: GameTask) => addGameTask(gamePoint)
}

export function useEditGameTask() {
  const editGameTask = useCallback(async (gameTask: GameTask) => {
    try {
      await requestByPost('/editGameTask', gameTask)
    } catch (error) {
      console.log('useEditGameTask error: ', error)
    }
  }, [])

  return (gameTask: GameTask) => editGameTask(gameTask)
}

export function useGameTaskPlanList() {
  const [gameTaskPlanList, setGameTaskPlanList] = useState<GameTaskPlanList>([])

  const getGameTaskPlanList = useCallback(async () => {
    try {
      const gameTaskPlanList = await requestByGet<GameTaskPlanList>('/getGameTaskPlanList')

      setGameTaskPlanList(gameTaskPlanList)
    } catch (error) {
      console.log('useTaskPlanList error: ', error)
    }
  }, [])

  useEffect(() => {
    getGameTaskPlanList()
  }, [])

  return { gameTaskPlanList, getGameTaskPlanList }
}