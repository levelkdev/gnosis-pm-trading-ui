import React, { Component } from 'react'
import PropTypes from 'prop-types'
import autobind from 'autobind-decorator'
import Outcome from 'components/Outcome'
import DecimalValue from 'components/DecimalValue'
import CurrencyName from 'components/CurrencyName'
import { add0xPrefix, weiToEth, getOutcomeName } from 'utils/helpers'
import { COLOR_SCHEME_DEFAULT } from 'utils/constants'
import moment from 'moment'
import Decimal from 'decimal.js'

import './dashboard.less'

const EXPAND_DEPOSIT = 'DEPOSIT'

const controlButtons = {
  /*
  [EXPAND_DEPOSIT]: {
    label: 'Make Deposit',
    className: 'btn btn-primary',
    component: <span>Make Deposit</span>,
  },
  [EXPAND_WITHDRAW]: {
    label: 'Withdraw Money',
    className: 'btn btn-default',
    component: <span>Withdraw Money</span>,
  },
  */
}

class Dashboard extends Component {

  constructor(props) {
    super(props)

    this.state = {
      expandableSelected: undefined,
    }
  }

  componentWillMount() {
    this.props.requestMarkets()
    this.props.requestAccountShares(this.props.defaultAccount)
    this.props.requestAccountTrades(this.props.defaultAccount)
  }

  @autobind
  handleViewMarket(market) {
    this.props.changeUrl(`/markets/${market.address}`)
  }

  @autobind
  handleCreateMarket() {
  /*
    const options = {
      title: 'Test Market',
      description: 'Test123',
      outcomes: ['Yes', 'No'],
      resolutionDate: new Date().toISOString(),
      funding: new BigNumber('0.2345'),
      fee: new BigNumber('12.00'),
      eventType: 'CATEGORICAL',
      oracleType: 'CENTRALIZED',
    }

    this.props.createMarket(options)*/
    this.props.changeUrl('/markets/new')
  }

  @autobind
  handleExpand(type) {
    // Toggle
    this.setState({ visibleControl: (this.state.visibleControl === type ? null : type) })
  }

  renderExpandableContent() {
    const { visibleControl } = this.state

    if (visibleControl === EXPAND_DEPOSIT) {
      // const {
      //   market,
      //   selectedCategoricalOutcome,
      //   selectedBuyInvest,
      //   buyShares,
      // } = this.props

      return (
        <div className="expandable__inner">
          <div className="container">
            <span>Something comes here</span>
          </div>
        </div>
      )
    }

    return <div />
  }


  renderControls() {
    return (
      <div className="dashboardControls container">
        <div className="row">
          <div className="col-xs-10 col-xs-offset-1 col-sm-12 col-sm-offset-0">
            {Object.keys(controlButtons).map(type => (
              <button
                key={type}
                type="button"
                className={`
                  dashboardControls__button
                  ${controlButtons[type].className}
                  ${type === this.state.visibleControl ? 'dashboardControls__button--active' : ''}`
                }
                onClick={() => this.handleExpand(type)}
              >
                {controlButtons[type].label}
              </button>
            ))}
            <button type="button" onClick={this.handleCreateMarket} className="dashboardControls__button btn btn-default">Create Market</button>
          </div>
        </div>
      </div>
    )
  }

  renderNewMarkets(markets) {
    return markets.map(market =>
      <div className="dashboardMarket dashboardMarket--new" key={market.address} onClick={() => this.handleViewMarket(market)}>
        <div className="dashboardMarket__title">{market.eventDescription.title}</div>
        <Outcome market={market} opts={{ showOnlyTrendingOutcome: true, showDate: true, dateFormat: 'MMMM Y' }} />
      </div>,
    )
  }

  renderClosingMarkets(markets) {
    return markets.map(market =>
      <div className="dashboardMarket dashboardMarket--closing dashboardMarket--twoColumns" key={market.address} onClick={() => this.handleViewMarket(market)}>
        <div className="dashboardMarket__leftCol">
          <div className="value">{moment.utc(market.eventDescription.resolutionDate).fromNow()}</div>
        </div>
        <div className="dashboardMarket__rightCol">
          <div className="dashboardMarket__title">{market.eventDescription.title}</div>
          <Outcome market={market} opts={{ showOnlyTrendingOutcome: true }} />
        </div>
      </div>,
    )
  }

  renderMyHoldings(holdings, markets) {
    return holdings.map((holding, index) => {
      const eventAddress = add0xPrefix(holding.outcomeToken.event)
      const filteredMarkets = markets.filter(market => market.event.address === eventAddress)
      const market = filteredMarkets.length ? filteredMarkets[0] : {}
      
      return (
        <div className="dashboardMarket dashboardMarket--onDark" key={index} onClick={() => this.handleViewMarket(market)}>
          <div className="dashboardMarket__title">{holding.eventDescription.title}</div>
          <div className="outcome row">
            <div className="col-md-3">
              <div className={'entry__color pull-left'} style={{ backgroundColor: COLOR_SCHEME_DEFAULT[holding.outcomeToken.index] }} />
              <div className="dashboardMarket--highlight pull-left">{getOutcomeName(market, holding.outcomeToken.index)}</div>
            </div>
            <div className="col-md-2 dashboardMarket--highlight">
              {market.marginalPrices ? Math.round(market.marginalPrices[holding.outcomeToken.index] * 100).toFixed(0) : 0}%
            </div>
            <div className="col-md-3 dashboardMarket--highlight">
              <DecimalValue value={weiToEth(holding.balance)} />&nbsp;
              {market.event ? (<CurrencyName collateralToken={market.event.collateralToken} />) : <div />}
            </div>
          </div>
        </div>
      )
    })
  }

  renderMyTrades(trades, markets) {
    return trades.map((trade, index) => {
      const eventAddress = add0xPrefix(trade.outcomeToken.event)
      const filteredMarkets = markets.filter(market => market.event.address === eventAddress)
      const market = filteredMarkets.length ? filteredMarkets[0] : {}
      const averagePrice = parseInt(trade.cost, 10) / parseInt(trade.outcomeTokenCount, 10)

      return (
        <div className="dashboardMarket dashboardMarket--onDark" key={index} onClick={() => this.handleViewMarket(market)}>
          <div className="dashboardMarket__title">{trade.eventDescription.title}</div>
          <div className="outcome row">
            <div className="col-md-3">
              <div className={'entry__color pull-left'} style={{ backgroundColor: COLOR_SCHEME_DEFAULT[trade.outcomeToken.index] }} />
              <div className="dashboardMarket--highlight">{getOutcomeName(market, trade.outcomeToken.index)}</div>
            </div>
            <div className="col-md-2 dashboardMarket--highlight">
              {new Decimal(averagePrice).toFixed(4)}
              &nbsp;{market.event ? (<CurrencyName collateralToken={market.event.collateralToken} />) : <div />}
            </div>
            <div className="col-md-3 dashboardMarket--highlight">
              {moment.utc(market.creationDate).format('MMMM Y')}
            </div>
            <div className="col-md-2 dashboardMarket--highlight">
              {trade.orderType}
            </div>
          </div>
        </div>
      )
    })
  }

  renderWidget(marketType) {
    const { markets, accountShares, accountTrades } = this.props
    const oneDayHours = 24 * 60 * 60 * 1000
    const newMarkets = markets.filter(market => new Date() - new Date(market.creationDate) < oneDayHours)
    const closingMarkets = markets.filter(
      market => moment.utc(market.eventDescription.resolutionDate).isBetween(moment(), moment().add(24, 'hours')),
    )

    if (marketType === 'newMarkets') {
      return (
        <div className="dashboardWidget col-md-6">
          <div className="dashboardWidget__title">New Markets</div>
          <div className="dashboardWidget__container">
            {newMarkets.length ? this.renderNewMarkets(newMarkets) : 'There aren\'t new markets'}
          </div>
        </div>
      )
    }

    if (marketType === 'closingMarkets') {
      return (
        <div className="dashboardWidget col-md-6">
          <div className="dashboardWidget__title">Soon-Closing Markets</div>
          <div className="dashboardWidget__container">
            {closingMarkets.length ? this.renderClosingMarkets(closingMarkets) : 'There aren\'t closing markets'}
          </div>
        </div>
      )
    }

    if (marketType === 'myHoldings') {
      return (
        <div className="dashboardWidget dashboardWidget--onDark col-md-6">
          <div className="dashboardWidget__title">My Holdings</div>
          <div className="dashboardWidget__container">
            {accountShares.length ? this.renderMyHoldings(accountShares, markets) : 'You aren\'t holding any share.'}
          </div>
        </div>
      )
    }

    if (marketType === 'myTrades') {
      return (
        <div className="dashboardWidget dashboardWidget--onDark col-md-6">
          <div className="dashboardWidget__title">My Trades</div>
          <div className="dashboardWidget__container">
            {accountTrades.length ? this.renderMyTrades(accountTrades, markets) : 'You haven\'t done any trade.'}
          </div>
        </div>
      )
    }
  }

  render() {
    const { accountPredictiveAssets, accountParticipatingInEvents } = this.props
    return (
      <div className="dashboardPage">
        <div className="dashboardPage__header">
          <div className="container">
            <div className="row">
              <div className="col-xs-10 col-xs-offset-1 col-sm-12 col-sm-offset-0">
                <h1>Welcome!</h1>
                <p className="marketDescription__text">Here is what happened since your last visit.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboardPage__stats">
          <div className="container">
            <div className="row dashboardStats">
              <div className="col-xs-10 col-xs-offset-1 col-sm-3 col-sm-offset-0 dashboardStats__stat">
                <div className="dashboardStats__icon icon icon--etherTokens" />
                <span className="dashboardStats__value">235</span>
                <div className="dashboardStats__label">Ether Tokens</div>
              </div>
              <div className="col-xs-10 col-xs-offset-1 col-sm-3 col-sm-offset-0 dashboardStats__stat">
                <div className="dashboardStats__icon icon icon--incomeForecast" />
                <span className="dashboardStats__value" style={{ color: 'green' }}>
                  <DecimalValue value={accountPredictiveAssets} />
                  &nbsp;ETH
                </span>
                <div className="dashboardStats__label">Predicted Profits</div>
              </div>
              <div className="col-xs-10 col-xs-offset-1 col-sm-3 col-sm-offset-0 dashboardStats__stat">
                <div className="dashboardStats__icon icon icon--new" />
                <span className="dashboardStats__value">{ accountParticipatingInEvents }</span>
                <div className="dashboardStats__label">Participating in Markets</div>
              </div>
            </div>
          </div>
        </div>
        { this.renderControls() }
        <div className="expandable">
          { this.renderExpandableContent() }
        </div>
        <div className="dashboardWidgets dashboardWidgets--markets">
          <div className="container">
            <div className="row">
              { this.renderWidget('newMarkets') }
              { this.renderWidget('closingMarkets') }
            </div>
          </div>
        </div>
        <div className="dashboardWidgets dashboardWidgets--financial">
          <div className="container">
            <div className="row">
              { this.renderWidget('myHoldings') }
              { this.renderWidget('myTrades') }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const marketPropType = PropTypes.object

Dashboard.propTypes = {
//   selectedCategoricalOutcome: PropTypes.string,
//   selectedBuyInvest: PropTypes.string,
//   buyShares: PropTypes.func,
//   market: marketPropType,
  markets: PropTypes.arrayOf(marketPropType),
  defaultAccount: PropTypes.string,
  accountShares: PropTypes.array,
  accountTrades: PropTypes.array,
  accountPredictiveAssets: PropTypes.string,
  accountParticipatingInEvents: PropTypes.number,
  requestMarkets: PropTypes.func,
  requestAccountShares: PropTypes.func,
  requestAccountTrades: PropTypes.func,
  changeUrl: PropTypes.func,
}

export default Dashboard
