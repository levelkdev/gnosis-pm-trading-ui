import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as modals from 'containers/modals'

import './backdrop.less'

class BackdropProvider extends Component {
  renderBackdropContent() {
    const { currentModal, isOpen, ...data } = this.props.modal

    if (isOpen) {
      /*
       * Implement more modals here by adding to components/modals.js
       */
      const Modal = modals[currentModal]

      if (!Modal) {
        throw Error('Invalid Modal Type', currentModal)
      }

      return <Modal {...data} />
    }

    return undefined
  }

  render() {
    const { children, modal: { isOpen } } = this.props
    return (
      <div className="backdrop">
        <div className={`backdrop__filter ${isOpen ? 'backdrop__filter--visible' : ''}`}>
          {children}
        </div>
        <div className="backdrop__above">
          {this.renderBackdropContent()}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  modal: state.modal,
})

export default connect(mapStateToProps)(BackdropProvider)
