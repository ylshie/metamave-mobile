import { getNetworkTypeById } from '../../../util/networks';
import { generateApprovalData } from '../../../util/transactions';
import { ParseOutput } from 'eth-url-parser';
import { strings } from '../../../../locales/i18n';
import { getAddress } from '../../../util/address';
import { addTransaction } from '../../../util/transaction-controller';
import DeeplinkManager from '../DeeplinkManager';
import Engine from '../../Engine';
import NotificationManager from '../../NotificationManager';
import { WalletDevice } from '@metamask/transaction-controller';
import { toChecksumHexAddress } from '@metamask/controller-utils';
import { Hex } from '@metamask/utils';
import { ORIGIN_METAMASK } from '@metamask/controller-utils';

async function approveTransaction({
  parameters, 
  target_address, 
  chain_id,
}: {
//deeplinkManager: DeeplinkManager;
//ethUrl: ParseOutput;
//origin: string;
  parameters: Record<string, string> | undefined;
  target_address: string; 
  chain_id: `${number}` | undefined;
}) {
  console.log("approveTransaction", 1)
  const { AccountsController, NetworkController } = Engine.context;

  console.log("approveTransaction", 2)
  /*  // Arthur
  if (chain_id) {
    const newNetworkType = getNetworkTypeById(chain_id);
    // @ts-expect-error TODO: Consolidate the network types used here with the controller-utils types
    NetworkController.setProviderType(newNetworkType);
  }
  */
  console.log("approveTransaction", 3)
  const uint256Number = Number(parameters?.uint256);

  console.log("approveTransaction", 4)
  if (Number.isNaN(uint256Number))
    throw new Error('The parameter uint256 should be a number');
  if (!Number.isInteger(uint256Number))
    throw new Error('The parameter uint256 should be an integer');

  console.log("approveTransaction", 5)
  const value = uint256Number.toString(16);

  console.log("approveTransaction", 6)
  const spenderAddress = await getAddress(
    parameters?.address || '',
    chain_id as string,
  );

  console.log("approveTransaction", 7)
  const selectedAccount = AccountsController.getSelectedAccount();

  console.log("selectedAccount", selectedAccount)
  const txParams = {
    to: target_address.toString(),
    from: toChecksumHexAddress(selectedAccount.address),
    value: '0x0',
    data: generateApprovalData({ spender: spenderAddress, value }),
  };
  console.log("approveTransaction", txParams)
  const networkClientId = NetworkController.findNetworkClientIdByChainId(
    chain_id as Hex,
  );
  console.log("chain_id", chain_id, "networkClientId", networkClientId)
  /*
  addTransaction(txParams, {
    deviceConfirmedOn: WalletDevice.MM_MOBILE,
    networkClientId,
    origin,
  });
  */
  return addTransaction(txParams, {
    deviceConfirmedOn: WalletDevice.MM_MOBILE,
    networkClientId,
    origin: ORIGIN_METAMASK,
  });
}

export default approveTransaction;
