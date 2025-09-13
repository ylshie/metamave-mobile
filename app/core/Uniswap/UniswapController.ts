import { BaseController } from "@metamask/base-controller"
import { RestrictedMessenger } from "@metamask/base-controller";
import { ControllerStateChangeEvent } from "@metamask/base-controller";
import { ExToken } from "../../components/UI/MeSwaps/uniswap/tokens";
import { estimateOut, swapTokensV2, testSendTransaction } from "../../components/UI/MeSwaps/uniswap";
import { PopulatedTransaction } from "ethers";

const name = 'UniswapController';
export type UniswapControllerState = {
//test: {};
  quote: any;
};

export type AddLog = {
  type: `${typeof name}:add`;
  handler: UniswapController['add'];
};
export type UniswapControllerStateChangeEvent = ControllerStateChangeEvent<
  typeof name,
  UniswapControllerState
>;
export type UniswapControllerActions  = AddLog;
export type UniswapControllerEvents   = UniswapControllerStateChangeEvent;

export type UniswapControllerMessenger = RestrictedMessenger<
  typeof name,
  UniswapControllerActions,
  UniswapControllerEvents,
  UniswapControllerActions['type'],
  UniswapControllerEvents['type']
>;

const metadata = {
  quote: { persist: false, anonymous: false },
};
export class UniswapController extends BaseController<typeof name, UniswapControllerState, UniswapControllerMessenger> {
    constructor ({
      messenger,
      state,
    }: {
      messenger: UniswapControllerMessenger;
      state?: Partial<UniswapControllerState>;
    }) {
      super({
        name,
        messenger, 
        metadata,
        state: {
          quote: undefined,
          ...state
        }
      })
    }
    public quote: any;
    add() {

    }
    testMe() {
        console.log('[Arthur]', '@UniswapController')    
    }
    startFetchAndSetQuotes(fetchParams: any, fetchParamsMetaData: any) {
      console.log('[Arthur]', '@UniswapController', 'startFetchAndSetQuotes')
      this.runQuotes(fetchParams, fetchParamsMetaData);
    }
    stopPollingAndResetState() {

    }
    async sendTX(tx: PopulatedTransaction) {
      testSendTransaction(tx)
    }
    async runQuotes(fetchParams: any, fetchParamsMetaData: any) {
      console.log('[Arthur]', '@UniswapController', 'startFetchAndSetQuotes')
      console.log('[Arthur]', '@UniswapController', 'fetchParams', fetchParams, fetchParamsMetaData)
      console.log('[Arthur]', '@UniswapController', 'state', this.state)
      try {
        const {account, sourceToken, destinationToken, sourceAmount} = fetchParams
        const BSC    = 56
        const tokenS = new ExToken(
          BSC,
          '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
        //sourceToken.address,    //"0xdAC17F958D2ee523a2206206994597C13D831ec7",
          sourceToken.decimals,   //6,
          sourceToken.symbol,     //"USDT",
          sourceToken.name,       //"Tether USD",
          sourceToken.iconUrl,    //"l_usdt.svg",
          1,
        );
        const tokenT = new ExToken(
          BSC,
          destinationToken.address,    //"0xdAC17F958D2ee523a2206206994597C13D831ec7",
          destinationToken.decimals,   //6,
          destinationToken.symbol,     //"USDT",
          destinationToken.name,       //"Tether USD",
          destinationToken.iconUrl,    //"l_usdt.svg",
          1,
        );
        console.log('[Arthur]', '[Swap]', '@resetAndStartPolling', 'estimateOut =>', account, sourceAmount, tokenT, tokenS)
        
      //const res = await estimateOut(tokenT, tokenS, 0.001)
        const res = await swapTokensV2(account, tokenT, tokenS, 0.001)
        console.log('[Arthur]', '[Swap]', '@resetAndStartPolling', 'estimateOut <=', sourceToken.name, sourceAmount, destinationToken.name, res)
      // this.quote = res;
        this.update((_state) => {
          console.log('[Arthur]','[Swap]', 'update', _state)
          _state.quote = res;
        });
        console.log('[Arthur]','[Swap]', 'update', this.state)
      } catch (error) {
        console.log('[Arthur]', '[Swap]', '@resetAndStartPolling', 'estimateOut exception', error)
      }
    }
}