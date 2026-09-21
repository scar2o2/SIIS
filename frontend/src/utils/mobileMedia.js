import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'

export function isNativeAndroid() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export async function captureReportImage() {
  const permissions = await Camera.checkPermissions()
  if (permissions.camera !== 'granted') {
    const requested = await Camera.requestPermissions({ permissions: ['camera'] })
    if (requested.camera !== 'granted') {
      throw new Error(
        'Camera permission is required. Allow camera access in Android Settings and try again.'
      )
    }
  }

  const photo = await Camera.getPhoto({
    quality: 90,
    source: CameraSource.Camera,
    resultType: CameraResultType.Uri,
    correctOrientation: true,
    saveToGallery: false,
  })

  const photoUrl = photo.webPath || (photo.path ? Capacitor.convertFileSrc(photo.path) : '')
  if (!photoUrl) {
    throw new Error('The captured image could not be read. Please try again.')
  }

  const response = await fetch(photoUrl)
  if (!response.ok) {
    throw new Error('The captured image could not be loaded. Please try again.')
  }

  const blob = await response.blob()
  const type = blob.type || `image/${photo.format || 'jpeg'}`
  const extension = type === 'image/png' ? 'png' : 'jpg'
  return new File([blob], `siis-capture-${Date.now()}.${extension}`, { type })
}

export async function getCurrentDeviceLocation() {
  if (isNativeAndroid()) {
    const current = await Geolocation.checkPermissions()
    if (current.location !== 'granted' && current.coarseLocation !== 'granted') {
      const requested = await Geolocation.requestPermissions()
      if (requested.location !== 'granted' && requested.coarseLocation !== 'granted') {
        throw new Error(
          'Location permission is required. Allow location access in Android Settings and try again.'
        )
      }
    }

    return Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    })
  }

  if (!navigator.geolocation) {
    throw new Error('Location is unavailable in this browser.')
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, () => {
      reject(new Error('Unable to get your current location. Enable GPS and try again.'))
    }, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    })
  })
}
