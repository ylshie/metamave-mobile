import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderScreen } from '../../../util/test/renderWithProvider';
import { AddAccountBottomSheetSelectorsIDs } from '../../../../e2e/selectors/wallet/AddAccountBottomSheet.selectors';
import AddAccountActions from './AddAccountActions';
import { addNewHdAccount } from '../../../actions/multiSrp';
import {
  createMockInternalAccount,
  MOCK_ACCOUNTS_CONTROLLER_STATE,
} from '../../../util/test/accountsControllerTestUtils';
import { BtcAccountType, SolAccountType } from '@metamask/keyring-api';
import { KeyringTypes } from '@metamask/keyring-controller';
import { MOCK_KEYRING_CONTROLLER } from '../../../selectors/keyringController/testUtils';
import { Text } from 'react-native';
import Routes from '../../../constants/navigation/Routes';
import Logger from '../../../util/Logger';
import { RootState } from '../../../reducers';

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockedNavigate,
    }),
  };
});

const mockTrackEvent = jest.fn();
jest.mock('../../../components/hooks/useMetrics', () => ({
  useMetrics: () => ({
    trackEvent: mockTrackEvent,
    createEventBuilder: () => ({
      build: () => ({}),
    }),
  }),
}));

jest.mock('../../../actions/multiSrp', () => ({
  addNewHdAccount: jest.fn(),
}));

// Mock Logger
jest.mock('../../../util/Logger', () => ({
  error: jest.fn(),
}));

const mockInitialState = {
  engine: {
    backgroundState: {
      AccountsController: MOCK_ACCOUNTS_CONTROLLER_STATE,
      KeyringController: MOCK_KEYRING_CONTROLLER,
    },
  },
};

const mockProps = {
  onBack: jest.fn(),
  onAddHdAccount: jest.fn(),
};

describe('AddAccountActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = renderScreen(
      () => <AddAccountActions {...mockProps} />,
      {
        name: 'AddAccountActions',
      },
      {
        state: mockInitialState,
      },
    );
    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('shows all account creation options', () => {
    renderScreen(
      () => <AddAccountActions {...mockProps} />,
      {
        name: 'AddAccountActions',
      },
      {
        state: mockInitialState,
      },
    );

    // Check for standard options
    expect(
      screen.getByTestId(AddAccountBottomSheetSelectorsIDs.NEW_ACCOUNT_BUTTON),
    ).toBeDefined();
    expect(
      screen.getByTestId(
        AddAccountBottomSheetSelectorsIDs.IMPORT_ACCOUNT_BUTTON,
      ),
    ).toBeDefined();

    // Check for multichain options
    expect(screen.getByText('Solana account')).toBeDefined();
    expect(screen.getByText('Bitcoin account')).toBeDefined();
    expect(screen.getByText('Bitcoin testnet account ')).toBeDefined();
  });

  it('creates new ETH account when clicking add new account', async () => {
    const mockNewAddress = '0x123';
    (addNewHdAccount as jest.Mock).mockResolvedValueOnce(mockNewAddress);

    renderScreen(
      () => <AddAccountActions {...mockProps} />,
      {
        name: 'AddAccountActions',
      },
      {
        state: mockInitialState,
      },
    );

    const addButton = screen.getByTestId(
      AddAccountBottomSheetSelectorsIDs.NEW_ACCOUNT_BUTTON,
    );
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(addNewHdAccount).toHaveBeenCalled();
      expect(mockProps.onBack).toHaveBeenCalled();
    });
  });

  it('handles error when creating new ETH account fails', async () => {
    const mockError = new Error('Failed to create account');
    (addNewHdAccount as jest.Mock).mockRejectedValueOnce(mockError);

    renderScreen(
      () => <AddAccountActions {...mockProps} />,
      {
        name: 'AddAccountActions',
      },
      {
        state: mockInitialState,
      },
    );

    const addButton = screen.getByTestId(
      AddAccountBottomSheetSelectorsIDs.NEW_ACCOUNT_BUTTON,
    );
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(Logger.error).toHaveBeenCalledWith(
        mockError,
        'error while trying to add a new account',
      );
      expect(mockProps.onBack).toHaveBeenCalled();
    });
  });

  it('navigates to import screen when clicking import account', () => {
    renderScreen(
      () => <AddAccountActions {...mockProps} />,
      {
        name: 'AddAccountActions',
      },
      {
        state: mockInitialState,
      },
    );

    const importButton = screen.getByTestId(
      AddAccountBottomSheetSelectorsIDs.IMPORT_ACCOUNT_BUTTON,
    );
    fireEvent.press(importButton);

    expect(mockedNavigate).toHaveBeenCalledWith('ImportPrivateKeyView');
    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('navigates to hardware wallet connection when clicking connect hardware wallet', () => {
    renderScreen(
      () => <AddAccountActions {...mockProps} />,
      {
        name: 'AddAccountActions',
      },
      {
        state: mockInitialState,
      },
    );

    const hardwareWalletButton = screen.getByTestId(
      AddAccountBottomSheetSelectorsIDs.ADD_HARDWARE_WALLET_BUTTON,
    );

    expect(hardwareWalletButton.findByType(Text).props.children).toBe(
      'Hardware wallet',
    );
    fireEvent.press(hardwareWalletButton);

    expect(mockedNavigate).toHaveBeenCalledWith(Routes.HW.CONNECT);
    expect(mockProps.onBack).toHaveBeenCalled();
  });

  describe('Multichain account creation', () => {
    const MOCK_SOL_ADDRESS = 'ATrXkbX2eEPuusRoLyRMW88wcPT2aho2Lk3xErnjjFH';
    const MOCK_BTC_MAINNET_ADDRESS =
      'bc1qkv7xptmd7ejmnnd399z9p643updvula5j4g4nd';

    const solAccount = createMockInternalAccount(
      MOCK_SOL_ADDRESS,
      'Solana Account',
      KeyringTypes.snap,
      SolAccountType.DataAccount,
    );

    const btcMainnetAccount = createMockInternalAccount(
      MOCK_BTC_MAINNET_ADDRESS,
      'Bitcoin Account',
      KeyringTypes.snap,
      BtcAccountType.P2wpkh,
    );

    it('does not disable Solana account creation when account already exists', () => {
      const stateWithSolAccount = {
        ...mockInitialState,
        engine: {
          ...mockInitialState.engine,
          backgroundState: {
            ...mockInitialState.engine.backgroundState,
            AccountsController: {
              ...MOCK_ACCOUNTS_CONTROLLER_STATE,
              internalAccounts: {
                ...MOCK_ACCOUNTS_CONTROLLER_STATE.internalAccounts,
                accounts: {
                  ...MOCK_ACCOUNTS_CONTROLLER_STATE.internalAccounts.accounts,
                  [solAccount.id]: solAccount,
                },
              },
            },
          },
        },
      } as unknown as RootState;

      renderScreen(
        () => <AddAccountActions {...mockProps} />,
        {
          name: 'AddAccountActions',
        },
        {
          state: stateWithSolAccount,
        },
      );

      const solButton = screen.getByTestId(
        AddAccountBottomSheetSelectorsIDs.ADD_SOLANA_ACCOUNT_BUTTON,
      );
      expect(solButton.findByType(Text).props.children).toBe('Solana account');
      expect(solButton.props.disabled).toBe(false);
    });

    it('disables Bitcoin account creation when account already exists', () => {
      const stateWithBtcAccount = {
        ...mockInitialState,
        engine: {
          ...mockInitialState.engine,
          backgroundState: {
            ...mockInitialState.engine.backgroundState,
            AccountsController: {
              ...MOCK_ACCOUNTS_CONTROLLER_STATE,
              internalAccounts: {
                ...MOCK_ACCOUNTS_CONTROLLER_STATE.internalAccounts,
                accounts: {
                  ...MOCK_ACCOUNTS_CONTROLLER_STATE.internalAccounts.accounts,
                  [btcMainnetAccount.id]: btcMainnetAccount,
                },
              },
            },
          },
        },
      } as unknown as RootState;

      renderScreen(
        () => <AddAccountActions {...mockProps} />,
        {
          name: 'AddAccountActions',
        },
        {
          state: stateWithBtcAccount,
        },
      );

      const btcButton = screen.getByTestId(
        AddAccountBottomSheetSelectorsIDs.ADD_BITCOIN_ACCOUNT_BUTTON,
      );
      expect(btcButton.findByType(Text).props.children).toBe('Bitcoin account');
      expect(btcButton.props.disabled).toBe(true);
    });

    it('handles error when creating Bitcoin account fails', async () => {
      renderScreen(
        () => <AddAccountActions {...mockProps} />,
        {
          name: 'AddAccountActions',
        },
        {
          state: mockInitialState,
        },
      );

      const btcButton = screen.getByTestId(
        AddAccountBottomSheetSelectorsIDs.ADD_BITCOIN_ACCOUNT_BUTTON,
      );
      fireEvent.press(btcButton);

      await waitFor(() => {
        expect(Logger.error).toHaveBeenCalledWith(
          expect.any(Error),
          'Bitcoin account creation failed',
        );
        expect(mockProps.onBack).toHaveBeenCalled();
      });
    });

    it('handles error when creating Solana account fails', async () => {
      renderScreen(
        () => <AddAccountActions {...mockProps} />,
        {
          name: 'AddAccountActions',
        },
        {
          state: mockInitialState,
        },
      );

      const solButton = screen.getByTestId(
        AddAccountBottomSheetSelectorsIDs.ADD_SOLANA_ACCOUNT_BUTTON,
      );
      fireEvent.press(solButton);

      await waitFor(() => {
        expect(Logger.error).toHaveBeenCalledWith(
          expect.any(Error),
          'Solana account creation failed',
        );
        expect(mockProps.onBack).toHaveBeenCalled();
      });
    });

    it('disables all buttons while loading', async () => {
      renderScreen(
        () => <AddAccountActions {...mockProps} />,
        {
          name: 'AddAccountActions',
        },
        {
          state: mockInitialState,
        },
      );

      const addButton = screen.getByTestId(
        AddAccountBottomSheetSelectorsIDs.NEW_ACCOUNT_BUTTON,
      );
      fireEvent.press(addButton);

      // Check that all buttons are disabled while loading
      expect(
        screen.getByTestId(AddAccountBottomSheetSelectorsIDs.NEW_ACCOUNT_BUTTON)
          .props.disabled,
      ).toBe(true);
      expect(
        screen.getByTestId(
          AddAccountBottomSheetSelectorsIDs.IMPORT_ACCOUNT_BUTTON,
        ).props.disabled,
      ).toBe(true);
      expect(
        screen.getByTestId(
          AddAccountBottomSheetSelectorsIDs.ADD_SOLANA_ACCOUNT_BUTTON,
        ).props.disabled,
      ).toBe(true);
      expect(
        screen.getByTestId(
          AddAccountBottomSheetSelectorsIDs.ADD_BITCOIN_ACCOUNT_BUTTON,
        ).props.disabled,
      ).toBe(true);
    });
  });

  describe('Multisrp', () => {
    const mockAccountInSecondKeyring = createMockInternalAccount(
      '0x67B2fAf7959fB61eb9746571041476Bbd0672569',
      'Account in second hd keyring',
    );
    const mockSecondHdKeyring = {
      type: KeyringTypes.hd,
      accounts: [],
    };
    const mockSecondHdKeyringMetadata = {
      id: '',
      name: '',
    };

    const stateWithMultipleHdKeyrings = {
      ...mockInitialState,
      engine: {
        ...mockInitialState.engine,
        backgroundState: {
          ...mockInitialState.engine.backgroundState,
          AccountsController: {
            ...MOCK_ACCOUNTS_CONTROLLER_STATE,
            internalAccounts: {
              ...MOCK_ACCOUNTS_CONTROLLER_STATE.internalAccounts,
              accounts: {
                ...MOCK_ACCOUNTS_CONTROLLER_STATE.internalAccounts.accounts,
                [mockAccountInSecondKeyring.id]: mockAccountInSecondKeyring,
              },
            },
          },
          KeyringController: {
            ...MOCK_KEYRING_CONTROLLER,
            keyrings: [
              ...MOCK_KEYRING_CONTROLLER.keyrings,
              mockSecondHdKeyring,
            ],
            keyringsMetadata: [
              ...MOCK_KEYRING_CONTROLLER.keyringsMetadata,
              mockSecondHdKeyringMetadata,
            ],
          },
        },
      },
    } as unknown as RootState;

    it('calls onAddHdAccount when there are multiple srps', async () => {
      renderScreen(
        () => <AddAccountActions {...mockProps} />,
        {
          name: 'AddAccountActions',
        },
        {
          state: stateWithMultipleHdKeyrings,
        },
      );

      const addAccountButton = screen.getByTestId(
        AddAccountBottomSheetSelectorsIDs.NEW_ACCOUNT_BUTTON,
      );
      await fireEvent.press(addAccountButton);

      expect(mockProps.onAddHdAccount).toHaveBeenCalled();
    });
  });
});
