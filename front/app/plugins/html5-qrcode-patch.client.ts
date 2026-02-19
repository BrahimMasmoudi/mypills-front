import { Html5Qrcode } from "html5-qrcode";

declare module '#app' {
    interface NuxtApp {
        $html5QrCode: typeof Html5Qrcode
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $html5QrCode: typeof Html5Qrcode
    }
}

export default defineNuxtPlugin((nuxtApp) => {
    // @ts-ignore: Patching private method foreverScan to support inverted codes
    Html5Qrcode.prototype.foreverScan = function (internalConfig, qrCodeSuccessCallback, qrCodeErrorCallback) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const _this = this as any;

        if (!_this.shouldScan) {
            return;
        }
        if (!_this.localMediaStream) {
            return;
        }

        const videoElement = _this.videoElement;
        const widthRatio = videoElement.videoWidth / videoElement.clientWidth;
        const heightRatio = videoElement.videoHeight / videoElement.clientHeight;

        if (!_this.qrRegion) {
            throw "qrRegion undefined when localMediaStream is ready.";
        }

        const sWidthOffset = _this.qrRegion.width * widthRatio;
        const sHeightOffset = _this.qrRegion.height * heightRatio;
        const sxOffset = _this.qrRegion.x * widthRatio;
        const syOffset = _this.qrRegion.y * heightRatio;

        // Draw original frame
        _this.context.drawImage(
            videoElement,
            sxOffset,
            syOffset,
            sWidthOffset,
            sHeightOffset,
            0,
            0,
            _this.qrRegion.width,
            _this.qrRegion.height
        );

        // Try to invert
        if (_this.context.filter) {
            _this.context.filter = 'invert(1)';
            _this.context.drawImage(
                videoElement,
                sxOffset,
                syOffset,
                sWidthOffset,
                sHeightOffset,
                0,
                0,
                _this.qrRegion.width,
                _this.qrRegion.height
            );
        } else {
            // Fallback for no filter support
            _this.context.drawImage(
                videoElement,
                sxOffset,
                syOffset,
                sWidthOffset,
                sHeightOffset,
                0,
                0,
                _this.qrRegion.width,
                _this.qrRegion.height
            );

            // Try difference composite operation
            _this.context.globalCompositeOperation = 'difference';

            if (_this.context.globalCompositeOperation === 'difference') {
                _this.context.fillStyle = 'white';
                _this.context.fillRect(0, 0, _this.qrRegion.width, _this.qrRegion.height);

                const canvas2 = document.createElement('canvas');
                const ctx2 = canvas2.getContext('2d');
                if (ctx2) {
                    canvas2.width = _this.qrRegion.width;
                    canvas2.height = _this.qrRegion.height;

                    ctx2.drawImage(
                        videoElement,
                        sxOffset,
                        syOffset,
                        sWidthOffset,
                        sHeightOffset,
                        0,
                        0,
                        _this.qrRegion.width,
                        _this.qrRegion.height
                    );

                    ctx2.globalCompositeOperation = 'source-in';
                    ctx2.fillStyle = 'black';
                    ctx2.fillRect(0, 0, _this.qrRegion.width, _this.qrRegion.height);

                    ctx2.globalCompositeOperation = 'destination-in';
                    _this.context.drawImage(
                        canvas2,
                        sxOffset,
                        syOffset,
                        sWidthOffset,
                        sHeightOffset,
                        0,
                        0,
                        _this.qrRegion.width,
                        _this.qrRegion.height
                    );
                }
            } else {
                // Last resort: manual pixel inversion
                try {
                    const imgData = _this.context.getImageData(0, 0, _this.qrRegion.width, _this.qrRegion.height);
                    const data = imgData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = 255 - data[i];     // R
                        data[i + 1] = 255 - data[i + 1]; // G
                        data[i + 2] = 255 - data[i + 2]; // B
                    }
                    _this.context.putImageData(imgData, 0, 0);
                } catch (e) {
                    // console.error("Manual inversion failed", e);
                }
            }
        }

        const triggerNextScan = () => {
            _this.foreverScanTimeout = setTimeout(() => {
                _this.foreverScan(internalConfig, qrCodeSuccessCallback, qrCodeErrorCallback);
            }, _this.getTimeoutFps(internalConfig.fps));
        };

        // Scan the inverted context
        _this.scanContext(qrCodeSuccessCallback, qrCodeErrorCallback)
            .then((isSuccessful: boolean) => {
                if (!isSuccessful) {
                    // If inverted scan failed, restore original and scan again
                    // Reset filter/composite
                    _this.context.filter = 'none';
                    _this.context.globalCompositeOperation = 'source-over';

                    _this.context.drawImage(
                        videoElement,
                        sxOffset,
                        syOffset,
                        sWidthOffset,
                        sHeightOffset,
                        0,
                        0,
                        _this.qrRegion.width,
                        _this.qrRegion.height
                    );

                    _this.scanContext(qrCodeSuccessCallback, qrCodeErrorCallback)
                        .finally(() => {
                            triggerNextScan();
                        });
                } else {
                    // Inverted scan successful
                    triggerNextScan();
                }
            })
            .catch((error: any) => {
                // _this.logger.logError("Error happened while scanning context", error);
                triggerNextScan();
            });
    };

    nuxtApp.provide('html5QrCode', Html5Qrcode)
});
