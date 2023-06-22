using Microsoft.AspNetCore.SignalR;

namespace RealTimeChatApp.WebApi.Hubs
{
    public class UserHub : Hub
    {
        //task lis message mesajlari doner api olmadan 
        private static List<string> userList = new List<string>();
        private static List<Message> messageList = new List<Message>();

        public List<string> GetUserList()
        {
            return userList;
        }

        public async Task AddUser(string username)
        {
            userList.Add(username);
            await Clients.All.SendAsync("UserAdded", username);
        }

        public async Task DeleteUser(string username)
        {
            userList.Remove(username);
            await Clients.All.SendAsync("UserDeleted", username);
        }

        public List<Message> GetMessageList()
        {
            return messageList;
        }

        public async Task AddMessage(Message message)
        {
            message.CreatedOn = DateTime.Now;
            messageList.Add(message);
            await Clients.All.SendAsync("MessageAdded", message);
        }

        public async Task GetUpdatedMessageList()
        {
            await Clients.Caller.SendAsync("MessageListUpdated", messageList);
        }
    }

    public class Message
    {
        public string Username { get; set; }
        public string Content { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}



