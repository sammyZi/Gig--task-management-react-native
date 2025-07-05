import { useState } from "react"

interface ModalConfig {
  title: string
  message?: string
  type?: "success" | "error" | "warning" | "info"
  buttons?: {
    text: string
    onPress: () => void
    style?: "default" | "destructive" | "cancel"
  }[]
}

export const useModal = () => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const showModal = (config: ModalConfig) => {
    setModalConfig(config)
    setIsVisible(true)
  }

  const hideModal = () => {
    setIsVisible(false)
    setTimeout(() => setModalConfig(null), 200) // Wait for animation
  }

  const showSuccess = (title: string, message?: string, onPress?: () => void) => {
    showModal({
      title,
      message,
      type: "success",
      buttons: [{ text: "OK", onPress: onPress || hideModal }],
    })
  }

  const showError = (title: string, message?: string, onPress?: () => void) => {
    showModal({
      title,
      message,
      type: "error",
      buttons: [{ text: "OK", onPress: onPress || hideModal }],
    })
  }

  const showConfirm = (
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText = "Confirm",
    cancelText = "Cancel",
  ) => {
    showModal({
      title,
      message,
      type: "warning",
      buttons: [
        { text: cancelText, onPress: onCancel || hideModal, style: "cancel" },
        { text: confirmText, onPress: onConfirm || hideModal, style: "destructive" },
      ],
    })
  }

  return {
    modalConfig,
    isVisible,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showConfirm,
  }
}
