import { Html5Qrcode } from 'html5-qrcode';
import React from 'react';
import PropTypes from 'prop-types';

const qrcodeRegionId = 'html5qr-code-full-region';

export class QrCodeScanner extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div id={qrcodeRegionId} style={{ width: '100%', height: '100%' }} />
    );
  }

  componentWillUnmount() {
    if (this.html5QrCode) {
      this.html5QrCode.stop();
    }
  }

  componentDidMount() {
    Html5Qrcode.getCameras()
      .then((devices) => {
        console.log('devices', devices);

        if (devices && devices.length && !this.html5QrCode) {
          this.html5QrCode = new Html5Qrcode(qrcodeRegionId);
          this.html5QrCode
            .start(
              { facingMode: 'environment' },
              {
                fps: 10, // Optional, frame per seconds for qr code scanning
                qrbox: (w, h) => ({ width: w / 2, height: w / 2 }), // Optional, if you want bounded box UI
                aspectRatio: window.innerHeight / window.innerWidth,
              },
              (decodedText, decodedResult) => {
                console.log('result', decodedText, decodedResult);
                this.props.onScanSuccess(decodedText);
              },
              (errorMessage) => {
                // console.error('Decode failed', errorMessage);
                this.props.onScanError(errorMessage);
              }
            )
            .catch((err) => {
              console.error('Start failed', err);
              this.props.onStartError(err);
            });
        }
      })
      .catch((err) => {
        console.error('Get cameras failed', err);
        this.props.onPermissionsError(err);
      });
  }
}

QrCodeScanner.propTypes = {
  onScanSuccess: PropTypes.func.isRequired,
  onScanError: PropTypes.func,
  onStartError: PropTypes.func,
  onPermissionsError: PropTypes.func,
};
