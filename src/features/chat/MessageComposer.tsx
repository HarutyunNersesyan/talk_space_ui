import React from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

interface Props {
    emojiPickerRef: React.RefObject<HTMLDivElement>;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    showEmojiPicker: boolean;
    toggleEmojiPicker: () => void;
    handleEmojiClick: (data: EmojiClickData) => void;
    newMessage: string;
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    sendMessage: () => void;
    sending: boolean;
    selectedPartner: string | null;
    canSend: boolean;
}
const MessageComposer: React.FC<Props> = ({ emojiPickerRef, inputRef, showEmojiPicker,
    toggleEmojiPicker, handleEmojiClick, newMessage, handleInputChange, handleKeyDown,
    sendMessage, sending, selectedPartner, canSend }) => (
    <footer className="chat-composer">
        <div className="chat-emoji-wrapper" ref={emojiPickerRef}>
            <button type="button" className={`chat-tool-button ${showEmojiPicker ? 'active' : ''}`}
                onClick={toggleEmojiPicker} aria-label="Emoji"><SentimentSatisfiedAltRoundedIcon /></button>
            {showEmojiPicker && <div className="chat-emoji-picker"><EmojiPicker onEmojiClick={handleEmojiClick}
                width={300} height={350} searchDisabled skinTonesDisabled previewConfig={{ showPreview: false }} lazyLoadEmojis /></div>}
        </div>
        <textarea ref={inputRef} value={newMessage} onChange={handleInputChange} onKeyDown={handleKeyDown}
            placeholder="Write a message..." maxLength={4000} disabled={!selectedPartner} rows={1} className="chat-message-input" />
        <button type="button" className={`chat-send-button ${newMessage.trim() && !sending ? 'active' : ''}`}
            onClick={sendMessage} disabled={!newMessage.trim() || sending || !canSend} aria-label="Send message"><SendRoundedIcon /></button>
    </footer>
);
export default MessageComposer;
