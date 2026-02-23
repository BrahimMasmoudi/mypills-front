import { Html5Qrcode } from 'html5-qrcode';

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

class PatchedHtml5Qrcode extends Html5Qrcode {

    constructor(elementId: string, configOrVerbosityFlag?: boolean | any) {
        super(elementId, configOrVerbosityFlag);

        // @ts-ignore
        this.foreverScan = this.patchedForeverScan.bind(this);
    }

    // @ts-ignore
    patchedForeverScan(internalConfig: any, qrCodeSuccessCallback: any, qrCodeErrorCallback: any) {
         
        const _this = this as any;

        if (!_this.shouldScan) {
            return;
        }
        if (!_this.renderedCamera) {
            setTimeout(() => {
                _this.foreverScan(internalConfig, qrCodeSuccessCallback, qrCodeErrorCallback);
            }, 100);
            return;
        }

        const videoElement = _this.renderedCamera.getSurface();
        const widthRatio = videoElement.videoWidth / videoElement.clientWidth;
        const heightRatio = videoElement.videoHeight / videoElement.clientHeight;

        if (!_this.qrRegion) {
            throw 'qrRegion undefined when localMediaStream is ready.';
        }

        const sWidthOffset = _this.qrRegion.width * widthRatio;
        const sHeightOffset = _this.qrRegion.height * heightRatio;
        const sxOffset = _this.qrRegion.x * widthRatio;
        const syOffset = _this.qrRegion.y * heightRatio;

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

        const triggerNextScan = () => {
            _this.foreverScanTimeout = setTimeout(() => {
                // @ts-ignore
                _this.foreverScan(internalConfig, qrCodeSuccessCallback, qrCodeErrorCallback);
            }, _this.getTimeoutFps(internalConfig.fps));
        };

        const scanInverted = () => {
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

                _this.context.globalCompositeOperation = 'difference';
                _this.context.fillStyle = 'white';
                _this.context.fillRect(0, 0, _this.qrRegion.width, _this.qrRegion.height);
            }

            return _this.scanContext(qrCodeSuccessCallback, qrCodeErrorCallback)
                .then((isSuccess: boolean) => {
                    // void
                })
                .catch((err: any) => {
                    // void
                });
        };

        _this.scanContext(qrCodeSuccessCallback, qrCodeErrorCallback)
            .then((isSuccess: boolean) => {
                if (isSuccess) {
                    triggerNextScan();
                } else {
                    scanInverted().finally(() => triggerNextScan());
                }
            })
            .catch((err: any) => {
                scanInverted().finally(() => triggerNextScan());
            });
    }
}

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.provide('html5QrCode', PatchedHtml5Qrcode)
});
