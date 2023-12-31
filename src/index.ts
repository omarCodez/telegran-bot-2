import express, { Express, Request, Response } from "express"
import TelegramBot, {
  KeyboardButton,
  Message,
  SendMessageOptions,
} from "node-telegram-bot-api"
import { prompts } from "./lib/prompt"
import dotenv from "dotenv"

type Username = {
  firstname: string
  lastname: string
}

export type PromptProps = {
  question: string
  response: {
    value: string
    text: string
  }[]
}

type UserSession = {
  currentStep: number
  data: SessionData
  responses: { value: string; text: string }[]
}

type SessionData = {
  currentPrompt?: PromptProps
}

// Response Actions
type ResponseAction = (chatId: number) => Promise<void>

const app: Express = express()

dotenv.config()

app.use(express.json())

// TODO: Install and setup `dotenv`
const PORT = process.env.PORT || 5001

const telegramBotToken =
  process.env.TELEGRAM_BOT_TOKEN ||
  `6458448932:AAHWKZiUp05ScxCM1TtRLF57aJULGuNL8ko`

// const webhookUrl = "https://telegram-bot-api-tawny.vercel.app"

const telegramBot = new TelegramBot(telegramBotToken, {
  polling: true,
})

let userName: { [chatId: number]: Username } = {}
let userResponses: { [chatId: number]: { value: string; text: string }[] } = {}
const userSession: Record<number, UserSession> = {}

// user options
let userClass
let subject
let altOpts
let pack: string = ""

const welcomeMessage = `
Instructions:
1. Read the Prompt carefully.
2. Reply with your chosen option.
3. Send 'hi' to start a conversation
4. Send '/start' to Restart From the Beginning.
5. Enjoy the conversation!
`

// ------------ Response Actions ---------------

const responseActions: Record<string, ResponseAction> = {
  Primary1: async (chatId: number) => {
    await telegramBot.sendMessage(chatId, "You selected Primary 1")
    await sendNextQuestion(chatId)
  },
  English: async (chatId: number) => {
    // Handle English option
    await telegramBot.sendMessage(chatId, "You selected English.")
  },
  Maths: async (chatId: number) => {
    // Handle Maths option
    await telegramBot.sendMessage(chatId, "You selected Maths.")
  },
  Science: async (chatId: number) => {
    // Handle Science optiondelete my project
    await telegramBot.sendMessage(chatId, "You selected Science.")
  },
  Biology: async (chatId: number) => {
    // Handle Biology option
    await telegramBot.sendMessage(chatId, "You selected Biology.")
  },
  // Add more response-action pairs as needed
}

// ------------ Response Actions End -----------

const sendNextQuestion = async (chatId: number): Promise<void> => {
  if (!userSession[chatId]) {
    userSession[chatId] = { currentStep: 0, data: {}, responses: [] }
  }

  const session = userSession[chatId]

  const finalMessage = `
Thanks ${userName[chatId]?.firstname},

It was really nice talking to you.

I'm glad I could be of assistance Today!
Here's the Link to your Study Pack.`

  const promptIndex = session.currentStep

  if (promptIndex < prompts.length) {
    const currentPrompt = prompts[promptIndex]

    const options = currentPrompt.response.map((resp) => [{ text: resp.text }])

    const question = `${promptIndex + 1} - ${currentPrompt.question}`

    // options

    session.currentStep++
    session.data.currentPrompt = currentPrompt

    const replyMarkup = {
      keyboard: options,
      resize_keyboard: true,
    }

    await telegramBot.sendMessage(chatId, question, {
      reply_markup: replyMarkup,
    })
  } else {
    // prompts completed
    delete userResponses[chatId] // is this correct / necessary?

    await telegramBot.sendMessage(chatId, finalMessage, {
      reply_markup: {
        keyboard: [],
        resize_keyboard: false,
        remove_keyboard: true,
      },
    })
    await sendPackLink(chatId, pack)
  }
}

// Send study pack link
const sendPackLink = async (chatId: number, pack: string): Promise<void> => {
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "Read Study Pack Online",
          url: pack,
        },
      ],
    ],
  }

  await telegramBot.sendMessage(
    chatId,
    `Click the Button  ⬇  to Download Your Pack!.`,
    {
      reply_markup: keyboard,
    }
  )
}

let classSelection: string
let studentClass: string
let subjectLink: string

telegramBot.on("message", async (message) => {
  const chatId = message.chat.id
  const response = message.text

  const session = userSession[chatId]

  if (session && session.data.currentPrompt) {
    const selectedOption = session.data.currentPrompt.response.find(
      (resp) => resp.text === response
    )

    if (selectedOption) {
      console.log(userSession[chatId].currentStep)
      console.log(selectedOption.text)
      session.responses.push(selectedOption)

      console.log("one here..... ", classSelection)

      if (session.currentStep === 2 && selectedOption.text === "No") {
        session.currentStep += 1
        await sendNextQuestion(chatId)
      } else if (session.currentStep === 3 && selectedOption.value) {
        // TODO:
        if (
          studentClass === "Primary 1" ||
          studentClass === "Primary 2" ||
          studentClass === "Primary 3"
        ) {
          switch (selectedOption.value) {
            case "English":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-1-3-English.pdf"
              break
            case "Maths":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-1-3-Mathematics.pdf"
              break
            case "Science":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-1-3-Science.pdf"
              break
            case "Art":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-1-3-Art.pdf"
              break
            case "Physical Education":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-1-3-Physical-Education.pdf"
              break
            case "Answers":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-1-3-Answers.pdf"
              break
            default:
              subjectLink = "https://google.com"
              break
          }
        } else if (
          studentClass === "Primary 4" ||
          studentClass === "Primary 5" ||
          studentClass === "Primary 6"
        ) {
          switch (selectedOption.value) {
            case "English":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-4-6-English.pdf"
              break
            case "Maths":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-4-6-Maths.pdf"
              break
            case "Science":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-4-6-Science.pdf"
              break
            case "Logic, Math Puzzles and Games":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-4-6-Logic-math-puzzles-and-games.pdf"
              break
            case "Well - Being":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-4-6-Well-Being.pdf"
              break
            case "Writing Prompts":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-4-6-Writing-Prompts.pdf"
              break
            case "Answers":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Pry-4-6-Answers.pdf"
              break
            default:
              subjectLink = "https://google.com"
              break
          }
        } else if (
          studentClass === "JSS 1" ||
          studentClass === "JSS 2" ||
          studentClass === "JSS 3"
        ) {
          switch (selectedOption.value) {
            case "English":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Jss1-3-English.pdf"
              break
            case "Maths":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Jss1-3-Maths.pdf"
              break
            case "Science":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Jss1-3-Science.pdf"
              break
            case "Logic, Math and Games":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Jss1-3-English.pdf"
              break
            case "Well - Being":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Jss1-3-Well-Being.pdf"
              break
            case "Writing Prompts":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/Jss1-3-Writing-prompts.pdf"
              break
            case "Answers":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/SS1-3-Answers.pdf"
              break
            default:
              subjectLink = "https://google.com"
              break
          }
        } else if (
          studentClass === "SSS 1" ||
          studentClass === "SSS 2" ||
          studentClass === "SSS 3"
        ) {
          switch (selectedOption.value) {
            case "Maths":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/SS1-3-Maths.pdf"
              break
            case "Answers":
              subjectLink =
                "https://oeqalagos.com/wp-content/uploads/2023/08/SS1-3-Answers.pdf"
            default:
              subjectLink = "https://google.com"
              break
          }
        } else {
          subjectLink = "https://google.com/wrong"
          console.log("something went wrong")
        }

        console.log("make sure > ", subjectLink)
        console.log("class selection ", classSelection)
        await sendPackLink(chatId, subjectLink)
      } else if (session.currentStep === 4 && selectedOption.value) {
        pack = getPackLink(selectedOption.value)
        await sendPackLink(chatId, pack)
      } else if (session.currentStep === 1 && selectedOption.value) {
        studentClass = selectedOption.value
        classSelection = getPackLink(selectedOption.value)

        await sendNextQuestion(chatId)
      } else {
        await sendNextQuestion(chatId)
      }
    } else {
      await telegramBot.sendMessage(chatId, `Invalid Selection`)
      console.log(session.currentStep)
    }
  }
  // If there is a current Prompt
})

// -----
const getPackLink = (value: string): string => {
  switch (value) {
    case "Primary 1":
      return "https://oeqalagos.com/wp-content/uploads/2020/03/Year-1-Home-Learning-Pack.pdf-min.pdf"
    case "Primary 2":
      return "https://oeqalagos.com/wp-content/uploads/2020/03/Year-2-Home-Learning-Pack.pdf-min.pdf"
    case "Primary 3":
      return "https://oeqalagos.com/wp-content/uploads/2020/03/Year-3-Home-Learning-Pack.pdf-min.pdf"
    case "Primary 4":
      return "https://oeqalagos.com/wp-content/uploads/2020/03/Year-4-Home-Learning-Pack.pdf-min.pdf"
    case "Primary 5":
      return "https://oeqalagos.com/wp-content/uploads/2020/03/Year-5-Home-Learning-Pack-.pdf-min.pdf"
    case "Primary 6":
      return "https://oeqalagos.com/wp-content/uploads/2020/03/Year-6-Home-Learning-Pack-min.pdf"
    case "Waec Prep Kit":
      return "https://oeqalagos.com/wp-content/uploads/2020/04/waec-prep-kit-min.pdf"
    case "Tips for Virtual Education":
      return "https://oeqalagos.com/wp-content/uploads/2020/04/Tips-for-Virtual-Education-min.pdf"
    default:
      return "https://oeqalagos.com/"
  }
}

const captureUserName = async (chatId: number) => {
  // Capture response
  await telegramBot.sendMessage(chatId, `What is your First and Last Name?`)
  telegramBot.once("message", async (responseMsg) => {
    const names = responseMsg.text

    if (names) {
      const [firstname, lastname] = names.split(" ", 2)

      userName[chatId] = {
        firstname,
        lastname,
      }

      await telegramBot.sendMessage(
        chatId,
        `
      Welcome! ${firstname}`
      )

      await sendNextQuestion(chatId)
    } else {
      await telegramBot.sendMessage(chatId, "Enter Your Names to Proceed!.")
      captureUserName(chatId) // Re-capture user's name if not provided
    }
  })
}

// restart
telegramBot.onText(/\/start/i, async (message) => {
  const chatId = message.chat.id

  userSession[chatId] = { currentStep: 0, data: {}, responses: [] }
  userResponses[chatId] = []
  delete userName[chatId]

  await telegramBot.sendMessage(chatId, welcomeMessage)

  captureUserName(chatId)
})

// check api health
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    msg: "Working fine.",
  })
})

// Create a route to handle incoming Telegram updates (webhook)
// app.post(`/${telegramBotToken}`, (req: Request, res: Response) => {
//   // process incoming update from telegram
//   telegramBot.processUpdate(req.body)
//   // respond to the request
//   res.status(200)
// })

// Set the webhook for the bot
// telegramBot.setWebHook(`${webhookUrl}/${telegramBotToken}`)

// Handle errors
telegramBot.on("polling_error", (error) => {
  console.error(error)
})

// Start Server
app.listen(PORT, async () => {
  // await telegramBot.setWebHook(webhookUrl)
  console.log(`Listening on PORT: ${PORT}`)
})
