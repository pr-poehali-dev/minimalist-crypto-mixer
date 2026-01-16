"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion, useAnimationControls } from "framer-motion"

const CheckIcon = ({ size = 16, strokeWidth = 3, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const OTPSuccess = () => {
  return (
    <div className="flex items-center justify-center gap-4 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 30 }}
        className="w-16 h-16 bg-green-500 ring-4 ring-green-100 dark:ring-green-900 text-white flex items-center justify-center rounded-full"
      >
        <CheckIcon size={32} strokeWidth={3} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-green-600 dark:text-green-400 font-semibold text-lg"
      >
        Вход выполнен!
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
      className="text-center text-red-500 dark:text-red-400 font-medium mt-2 absolute -bottom-8 w-full"
    >
      Неверный код. Попробуйте снова.
    </motion.div>
  )
}

const OTPInputBox = ({ index, verifyOTP, state, inputCount = 6 }) => {
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
      const transitionX = index * 68
      animationControls.start({
        x: -transitionX,
        transition: slowSuccessTransition,
      })
    }
  }, [state, index, animationControls])

  const onFocus = () => {
    animationControls.start({ y: -5, transition: noDelaySpringTransition })
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

  return (
    <motion.div
      className={`w-14 h-16 rounded-lg ring-2 ring-transparent focus-within:shadow-inner overflow-hidden transition-all duration-300 ${
        state === "error"
          ? "ring-red-400 dark:ring-red-500"
          : state === "success"
            ? "ring-green-500"
            : "focus-within:ring-black/40 ring-black/20"
      }`}
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
        className="w-full h-full text-center text-3xl font-semibold outline-none caret-black bg-white"
        disabled={state === "success"}
      />
    </motion.div>
  )
}

export function OTPVerification({ 
  inputCount = 6, 
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
    <div
      className="rounded-3xl p-8 w-full max-w-sm shadow-2xl relative overflow-hidden bg-white"
    >
      <div className="relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">
          {state === "success" ? "Вход выполнен!" : "Введите код из Telegram"}
        </h1>

        <AnimatePresence mode="wait">
          {state === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
              style={{ height: "232px" }}
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
              <p className="text-center text-gray-600 mt-2 mb-8">
                Мы отправили {inputCount}-значный код в Telegram
                <br /> <span className="font-medium text-gray-800">{telegram_username}</span>
              </p>

              <div className="flex flex-col items-center justify-center gap-2 mb-10 relative h-20">
                <motion.div animate={animationControls} className="flex items-center justify-center gap-2">
                  {Array.from({ length: inputCount }).map((_, index) => (
                    <OTPInputBox key={`input-${index}`} index={index} verifyOTP={verifyOTP} state={state} inputCount={inputCount} />
                  ))}
                </motion.div>
                <AnimatePresence>{state === "error" && <OTPError />}</AnimatePresence>
              </div>

              <div className="text-center">
                <span className="text-gray-600">Не пришёл код? </span>
                {isResendDisabled ? (
                  <span className="text-gray-500">Повтор через {countdown}с</span>
                ) : (
                  <button
                    onClick={handleResend}
                    className="font-medium text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                  >
                    Отправить снова
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}