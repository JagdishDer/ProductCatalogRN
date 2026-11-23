
package com.productcatalogrn

import android.Manifest
import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.MediaStore
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class CameraModule(
    private val context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {

    private var pendingPromise: Promise? = null
    private var photoFile: File? = null

    override fun getName(): String = "CameraModule"

    init {
        context.addActivityEventListener(
            object : BaseActivityEventListener() {
                override fun onActivityResult(
                    activity: Activity,
                    requestCode: Int,
                    resultCode: Int,
                    data: Intent?
                ) {
                    if (requestCode != REQUEST_CODE) return

                    val promise = pendingPromise ?: return
                    val file = photoFile

                    pendingPromise = null
                    photoFile = null

                    if (
                        resultCode == Activity.RESULT_OK &&
                        file != null &&
                        file.exists() &&
                        file.length() > 0
                    ) {
                        promise.resolve(
                            Uri.fromFile(file).toString()
                        )
                    } else {
                        file?.delete()
                        promise.reject(
                            "E_CANCELLED",
                            "Camera capture cancelled or failed"
                        )
                    }
                }
            }
        )
    }

    @ReactMethod
    fun capturePhoto(promise: Promise) {
        if (pendingPromise != null) {
            promise.reject(
                "E_BUSY",
                "Camera is already active"
            )
            return
        }

        val activity = reactApplicationContext.currentActivity

        if (activity == null) {
            promise.reject(
                "E_ACTIVITY",
                "No active Android activity"
            )
            return
        }

        val permission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CAMERA
        )

        if (permission != PackageManager.PERMISSION_GRANTED) {
            promise.reject(
                "E_PERMISSION",
                "Camera permission denied"
            )
            return
        }

        try {
            val directory = File(
                context.cacheDir,
                "camera"
            )

            if (!directory.exists() && !directory.mkdirs()) {
                throw IllegalStateException(
                    "Cannot create photo directory"
                )
            }

            val file = File.createTempFile(
                "product_",
                ".jpg",
                directory
            )

            val uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            val intent = Intent(
                MediaStore.ACTION_IMAGE_CAPTURE
            ).apply {
                putExtra(MediaStore.EXTRA_OUTPUT, uri)

                clipData = ClipData.newUri(
                    context.contentResolver,
                    "Product photo",
                    uri
                )

                addFlags(
                    Intent.FLAG_GRANT_READ_URI_PERMISSION or
                        Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )
            }

            pendingPromise = promise
            photoFile = file

            activity.startActivityForResult(
                intent,
                REQUEST_CODE
            )

        } catch (e: Exception) {
            pendingPromise = null
            photoFile?.delete()
            photoFile = null

            promise.reject(
                "E_CAMERA",
                "Unable to open camera",
                e
            )
        }
    }

    companion object {
        private const val REQUEST_CODE = 8701
    }
}
