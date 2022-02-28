import { Form, Button, List, Avatar, Space, Select } from 'antd'
import { useReducer } from 'react'
import { AddAccount } from './components'
import { useAddAccount, useChangeCaptainAccount, useGameAccountList } from './hooks'
import styles from './accountListManage.module.scss'

const FormItem = Form.Item
const ListItem = List.Item
const ListItemMeta = ListItem.Meta
const SelectOption = Select.Option

interface IState {
  addModalVisible: boolean
  captainAccountMap: Map<string, boolean>
}

type IActionTypes = 'SET_ADD_MODAL_VISIBLE' | 'SET_CAPTAIN_ACCOUNT_MAP'

function reducer(state: IState, action: { type: IActionTypes; payload: Partial<IState> }) {
  switch (action.type) {
    case 'SET_ADD_MODAL_VISIBLE':
    case 'SET_CAPTAIN_ACCOUNT_MAP':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const initialState: IState = { addModalVisible: false, captainAccountMap: new Map() }

export default function AccountListManage() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { addModalVisible, captainAccountMap } = state

  const { gameAccountList, getGameAccountList } = useGameAccountList()
  const changeCaptainAccount = useChangeCaptainAccount()
  const addAccount = useAddAccount()

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
                        <span>
                          角色名：<span>{item.roleInfo?.roleName}</span>
                        </span>
                        <span>
                          等级：<span>{item.roleInfo?.rank}</span>
                        </span>
                        <span>
                          状态：<span>{item.roleInfo?.loginStatus}</span>
                        </span>
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
    </Form>
  )
}
