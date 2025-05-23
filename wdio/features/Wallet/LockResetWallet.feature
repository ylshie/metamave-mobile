@androidApp
@smoke
@wallet
@fixturesSkipOnboarding
Feature: Lock and Reset Wallet

  Scenario: Skip onboarding
    Given the app displayed the splash animation
    And I unlock wallet with <password>
    Examples:
      | password  |
      | 123123123 |

  Scenario Outline: Lock Wallet
    When I tap on the Settings tab option
    And In settings I tap on the Lock Option
    Then device alert <alert_msg> is displayed
    When I tap Yes on alert
    Then Login screen is displayed
    Examples:
      | alert_msg                               |
      | Do you really want to lock your wallet? |

  Scenario: Reset Wallet
    When I tap Reset Wallet on Login screen
    And I tap I understand, continue on Delete wallet modal
    And I type "delete" on Delete wallet modal permanently
    And I tap Delete my wallet on Delete wallet modal permanently
    Then Wallet setup screen is displayed
