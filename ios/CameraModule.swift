
import Foundation
import UIKit
import AVFoundation

@objc(CameraModule)
final class CameraModule: NSObject,
    UIImagePickerControllerDelegate,
    UINavigationControllerDelegate {

    private var pendingResolve: RCTPromiseResolveBlock?
    private var pendingReject: RCTPromiseRejectBlock?

    @objc static func requiresMainQueueSetup() -> Bool {
        true
    }

    @objc(capturePhoto:rejecter:)
    func capturePhoto(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            guard self.pendingResolve == nil else {
                reject("E_BUSY", "Camera already active", nil)
                return
            }

            guard UIImagePickerController.isSourceTypeAvailable(
                .camera
            ) else {
                reject(
                    "E_UNAVAILABLE",
                    "Camera is not available on this device",
                    nil
                )
                return
            }

            switch AVCaptureDevice.authorizationStatus(
                for: .video
            ) {
            case .authorized:
                self.openCamera(
                    resolve: resolve,
                    reject: reject
                )

            case .notDetermined:
                AVCaptureDevice.requestAccess(
                    for: .video
                ) { granted in
                    DispatchQueue.main.async {
                        if granted {
                            self.openCamera(
                                resolve: resolve,
                                reject: reject
                            )
                        } else {
                            reject(
                                "E_PERMISSION",
                                "Camera permission denied",
                                nil
                            )
                        }
                    }
                }

            default:
                reject(
                    "E_PERMISSION",
                    "Camera permission denied or restricted",
                    nil
                )
            }
        }
    }

    private func openCamera(
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let scene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first(where: { $0.activationState == .foregroundActive }),
              let root = scene.windows
                .first(where: { $0.isKeyWindow })?
                .rootViewController else {
            reject(
                "E_ACTIVITY",
                "No active view controller",
                nil
            )
            return
        }

        var presenter = root
        while let presented = presenter.presentedViewController {
            presenter = presented
        }

        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = self
        picker.allowsEditing = false

        pendingResolve = resolve
        pendingReject = reject

        presenter.present(picker, animated: true)
    }

    func imagePickerController(
        _ picker: UIImagePickerController,
        didFinishPickingMediaWithInfo info:
            [UIImagePickerController.InfoKey: Any]
    ) {
        guard let image = info[.originalImage] as? UIImage,
              let jpeg = image.jpegData(
                compressionQuality: 0.85
              ) else {
            finish(
                picker,
                errorCode: "E_IMAGE",
                message: "Could not process image"
            )
            return
        }

        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent(
                UUID().uuidString + ".jpg"
            )

        do {
            try jpeg.write(to: url)

            let resolve = pendingResolve
            pendingResolve = nil
            pendingReject = nil

            picker.dismiss(animated: true) {
                resolve?(url.absoluteString)
            }
        } catch {
            finish(
                picker,
                errorCode: "E_SAVE",
                message: "Could not save captured photo"
            )
        }
    }

    func imagePickerControllerDidCancel(
        _ picker: UIImagePickerController
    ) {
        finish(
            picker,
            errorCode: "E_CANCELLED",
            message: "Camera cancelled"
        )
    }

    private func finish(
        _ picker: UIImagePickerController,
        errorCode: String,
        message: String
    ) {
        let reject = pendingReject
        pendingResolve = nil
        pendingReject = nil

        picker.dismiss(animated: true) {
            reject?(errorCode, message, nil)
        }
    }
}
