import { Form, Button, List, Avatar, Space, Select, Table } from 'antd'
import { useReducer } from 'react'
import { AddAccount, BattlePlan, IRecord } from './components'
import { useAddAccount, useChangeCaptainAccount, useChangeRoleBattlePlan, useGameAccountList } from './hooks'
import styles from './accountListManage.module.scss'

const FormItem = Form.Item
const ListItem = List.Item
const ListItemMeta = ListItem.Meta
const SelectOption = Select.Option

interface IState {
  addModalVisible: boolean
  battlePlanVisible: boolean
  record?: IRecord
  captainAccountMap: Map<string, boolean>
}

type IActionTypes = 'SET_RECORD' | 'SET_ADD_MODAL_VISIBLE' | 'SET_CAPTAIN_ACCOUNT_MAP' | 'SET_BATTLE_PLAN_VISIBLE'

function reducer(state: IState, action: { type: IActionTypes; payload: Partial<IState> }) {
  switch (action.type) {
    case 'SET_RECORD':
    case 'SET_ADD_MODAL_VISIBLE':
    case 'SET_CAPTAIN_ACCOUNT_MAP':
    case 'SET_BATTLE_PLAN_VISIBLE':
      return { ...state, ...action.payload }
    default:
      const actionType: never = action.type

      console.log('actionType: ', actionType)
      return state
  }
}

const initialState: IState = {
  addModalVisible: false,
  battlePlanVisible: false,
  captainAccountMap: new Map(),
}

export default function AccountListManage() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { addModalVisible, captainAccountMap, battlePlanVisible, record } = state

  const addAccount = useAddAccount()
  const changeCaptainAccount = useChangeCaptainAccount()
  const changeRoleBattlePlan = useChangeRoleBattlePlan()
  const { gameAccountList, getGameAccountList } = useGameAccountList()

  const showAddModal = () => dispatch({ type: 'SET_ADD_MODAL_VISIBLE', payload: { addModalVisible: true } })
  const hideAddModal = () => dispatch({ type: 'SET_ADD_MODAL_VISIBLE', payload: { addModalVisible: false } })

  const handleCaptianAccountSelectClick = (groupName: string) =>
    dispatch({
      type: 'SET_CAPTAIN_ACCOUNT_MAP',
      payload: { captainAccountMap: new Map(captainAccountMap).set(groupName, true) },
    })

  const handleCaptianAccountSelectChange = async (groupName: string, captainAccount: string) => {
    await changeCaptainAccount({ groupName, captainAccount })
    dispatch({
      type: 'SET_CAPTAIN_ACCOUNT_MAP',
      payload: { captainAccountMap: new Map(captainAccountMap).set(groupName, false) },
    })
    getGameAccountList()
  }

  const showBattlePlan = () => dispatch({ type: 'SET_BATTLE_PLAN_VISIBLE', payload: { battlePlanVisible: true } })
  const hideBattlePlan = () => dispatch({ type: 'SET_BATTLE_PLAN_VISIBLE', payload: { battlePlanVisible: false } })

  const handleChangeBattlePlanClick = (record: IRecord) => {
    showBattlePlan()
    dispatch({ type: 'SET_RECORD', payload: { record } })
  }

  return (
    <Form>
      <FormItem>
        <Button type="primary" onClick={showAddModal}>
          添加
        </Button>
      </FormItem>

      {gameAccountList.map((group) => (
        <div key={group.groupName} className={styles.groupList}>
          <h3 className="descriptions title">
            <Space size="large">
              <span>
                账户分组：<span>{group.groupName}</span>
              </span>
              <span>
                服务区组：<span>{group.serverGroup.join(' / ')}</span>
              </span>
              <span>
                队长账号：
                <Select
                  style={{ width: 150 }}
                  value={group.captainAccount}
                  onChange={handleCaptianAccountSelectChange.bind(null, group.groupName)}
                  disabled={!(captainAccountMap.get(group.groupName) || false)}
                  onClick={handleCaptianAccountSelectClick.bind(null, group.groupName)}
                >
                  {group.accountList.map((account) => (
                    <SelectOption key={account.id} value={account.id}>
                      {account.account}
                    </SelectOption>
                  ))}
                </Select>
              </span>
              <Button type="ghost" danger>
                一键登录
              </Button>
              <Button type="ghost" danger>
                一键换人
              </Button>
            </Space>
          </h3>
          <List
            itemLayout="vertical"
            dataSource={group.accountList}
            renderItem={(item) => (
              <ListItem key={item.account} className="descriptions">
                <ListItemMeta
                  avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                  title={
                    <div className={styles.listItem}>
                      <div>
                        <span>
                          账号：<span>{item.account}</span>
                        </span>
                        <Table
                          rowKey="roleName"
                          pagination={false}
                          dataSource={item.roleList}
                          columns={[
                            {
                              title: '角色头像',
                              dataIndex: 'roleAvatar',
                              width: 120,
                              align: 'center',
                            },
                            {
                              title: '角色名',
                              dataIndex: 'roleName',
                              align: 'center',
                            },
                            {
                              title: '角色等级',
                              dataIndex: 'rank',
                              align: 'center',
                            },
                            {
                              title: '战斗方案',
                              dataIndex: 'battlePlan',
                              width: 300,
                              align: 'center',
                              render: (battlePlan, record) => (
                                <a
                                  href="#"
                                  onClick={handleChangeBattlePlanClick.bind(null, {
                                    ...record,
                                    account: item.account,
                                    groupName: group.groupName,
                                  })}
                                >
                                  {JSON.stringify(battlePlan)}
                                </a>
                              ),
                            },
                          ]}
                        />
                      </div>
                    </div>
                  }
                />
              </ListItem>
            )}
          />
        </div>
      ))}

      <AddAccount
        addAccount={addAccount}
        hideModal={hideAddModal}
        visible={addModalVisible}
        refreshData={getGameAccountList}
        accountAndServerGroupList={gameAccountList.map((item) => ({
          groupName: item.groupName,
          serverGroup: item.serverGroup.join(' / '),
          accountsNum: item.accountList.length,
        }))}
      />
      {record && (
        <BattlePlan
          record={record}
          key={record.roleName}
          hideModal={hideBattlePlan}
          visibel={battlePlanVisible}
          refreshData={getGameAccountList}
          changeRoleBattlePlan={changeRoleBattlePlan}
        />
      )}
    </Form>
  )
}
