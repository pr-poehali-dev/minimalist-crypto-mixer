"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion, useAnimationControls } from "framer-motion"
import Icon from "@/components/ui/icon"

const OTPSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full py-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 30 }}
        className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center rounded-full shadow-lg shadow-emerald-200"
      >
        <Icon name="Check" size={28} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-emerald-600 font-semibold text-base"
      >
        Вы вошли!
      </motion.p>
    </div>
  )
}

const OTPError = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="text-center text-red-500 font-medium text-xs mt-1 absolute -bottom-6 w-full"
    >
      Неверный код. Попробуйте снова.
    </motion.div>
  )
}

const OTPInputBox = ({ index, verifyOTP, state, inputCount = 4 }) => {
  const animationControls = useAnimationControls()
  const springTransition = {
    type: "spring",
    stiffness: 700,
    damping: 20,
    delay: index * 0.05,
  }
  const noDelaySpringTransition = {
    type: "spring",
    stiffness: 700,
    damping: 20,
  }
  const slowSuccessTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    delay: index * 0.06,
  }

  useEffect(() => {
    animationControls.start({
      opacity: 1,
      y: 0,
      transition: springTransition,
    })
    return () => animationControls.stop()
  }, [])

  useEffect(() => {
    if (state === "success") {
      const transitionX = index * 60
      animationControls.start({
        x: -transitionX,
        transition: slowSuccessTransition,
      })
    }
  }, [state, index, animationControls])

  const onFocus = () => {
    animationControls.start({ y: -3, transition: noDelaySpringTransition })
  }

  const onBlur = () => {
    animationControls.start({ y: 0, transition: noDelaySpringTransition })
  }

  const onKeyDown = (e) => {
    const { value } = e.target
    if (e.key === "Backspace" && !value && index > 0) {
      document.getElementById(`input-${index - 1}`)?.focus()
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`input-${index - 1}`)?.focus()
    } else if (e.key === "ArrowRight" && index < inputCount - 1) {
      document.getElementById(`input-${index + 1}`)?.focus()
    }
  }

  const onInput = (e) => {
    const { value } = e.target
    if (value.match(/^[0-9]$/)) {
      e.target.value = value
      if (index < inputCount - 1) {
        document.getElementById(`input-${index + 1}`)?.focus()
      }
    } else {
      e.target.value = ""
    }
    verifyOTP()
  }

  const onPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim().slice(0, inputCount)
    const digits = pastedData.split("").filter((char) => /^[0-9]$/.test(char))

    digits.forEach((digit, i) => {
      const targetIndex = index + i
      if (targetIndex < inputCount) {
        const input = document.getElementById(`input-${targetIndex}`)
        if (input) {
          input.value = digit
        }
      }
    })

    const nextFocusIndex = Math.min(index + digits.length, inputCount - 1)
    document.getElementById(`input-${nextFocusIndex}`)?.focus()

    setTimeout(verifyOTP, 0)
  }

  const getBorderStyle = () => {
    if (state === "error") return "border-red-400 shadow-sm shadow-red-100"
    if (state === "success") return "border-emerald-400 shadow-sm shadow-emerald-100"
    return "border-gray-200 focus-within:border-blue-500 focus-within:shadow-md focus-within:shadow-blue-100"
  }

  return (
    <motion.div
      className={`w-12 h-14 rounded-xl border-2 overflow-hidden transition-all duration-200 bg-gray-50/80 ${getBorderStyle()}`}
      initial={{ opacity: 0, y: 10 }}
      animate={animationControls}
    >
      <input
        id={`input-${index}`}
        type="text"
        inputMode="numeric"
        maxLength={1}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full h-full text-center text-2xl font-bold outline-none caret-blue-500 bg-transparent text-gray-900"
        disabled={state === "success"}
      />
    </motion.div>
  )
}

export function OTPVerification({ 
  inputCount = 4, 
  onVerify, 
  onResend,
  telegram_username = ""
}) {
  const [state, setState] = useState("idle")
  const [countdown, setCountdown] = useState(60)
  const [isResendDisabled, setIsResendDisabled] = useState(true)
  const animationControls = useAnimationControls()

  useEffect(() => {
    let timer
    if (isResendDisabled) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer)
            setIsResendDisabled(false)
            return 0
          }
          return prevCountdown - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isResendDisabled])

  const getCode = () => {
    let code = ""
    for (let i = 0; i < inputCount; i++) {
      const input = document.getElementById(`input-${i}`)
      if (input) code += input.value
    }
    return code
  }

  const verifyOTP = async () => {
    const code = getCode()
    if (code.length < inputCount) {
      setState("idle")
      return null
    }

    if (onVerify) {
      const result = await onVerify(code)
      if (result === true) {
        setState("success")
        return true
      } else {
        errorAnimation()
        return false
      }
    }
  }

  const errorAnimation = async () => {
    setState("error")
    await animationControls.start({
      x: [0, 5, -5, 5, -5, 0],
      transition: { duration: 0.3 },
    })
    setTimeout(() => {
      if (getCode().length < inputCount) setState("idle")
    }, 500)
  }

  const handleResend = () => {
    if (onResend) onResend()
    setCountdown(60)
    setIsResendDisabled(true)
  }

  return (
    <div className="w-full max-w-sm relative">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Icon name="MessageCircle" size={24} className="text-white" />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-center text-gray-900 mb-1">
        {state === "success" ? "Готово!" : "Введите код"}
      </h2>

      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
            style={{ height: "160px" }}
          >
            <OTPSuccess />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-center text-gray-500 text-xs mb-6">
              Мы отправили {inputCount}-значный код в Telegram
              <br />
              <span className="font-medium text-gray-700">{telegram_username}</span>
            </p>

            <div className="flex flex-col items-center justify-center gap-2 mb-8 relative">
              <motion.div animate={animationControls} className="flex items-center justify-center gap-2.5">
                {Array.from({ length: inputCount }).map((_, index) => (
                  <OTPInputBox key={`input-${index}`} index={index} verifyOTP={verifyOTP} state={state} inputCount={inputCount} />
                ))}
              </motion.div>
              <AnimatePresence>{state === "error" && <OTPError />}</AnimatePresence>
            </div>

            <div className="text-center text-xs">
              <span className="text-gray-400">Не пришёл код? </span>
              {isResendDisabled ? (
                <span className="text-gray-400 tabular-nums">Повтор через {countdown}с</span>
              ) : (
                <button
                  onClick={handleResend}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none transition-colors"
                >
                  Отправить снова
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OTPVerification
