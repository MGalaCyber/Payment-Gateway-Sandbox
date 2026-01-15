const Config = require("../config");

module.exports = {
    Telegram: async message => {
        try {
            let threadId = Config.System.Logger.Telegram.ThreadId;
            if (!threadId) {
                threadId = null;
            }

            const response = await fetch(`https://api.telegram.org/bot${Config.System.Logger.Telegram.ClientId}:${Config.System.Logger.Telegram.ClientToken}/sendMessage`, {
                method: "POST",
                maxBodyLength: Infinity,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    parse_mode: "HTML",
                    chat_id: Config.System.Logger.Telegram.ChatId,
                    ...(threadId && { message_thread_id: threadId }),
                    text: message,
                }),
            });
            const result = await response.json();
            return { status: true };
        } catch (error) {
            console.log(error);
            return { status: false };
        }
    },
};
