import { toast } from 'react-hot-toast';

/**
 * Copies text to clipboard and shows a toast notification
 * @param text The string to copy
 * @param message Success message to display in toast
 */
export const copyToClipboard = async (text: string, message: string = 'Copied to clipboard!') => {
    if (!text) return;
    
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            toast.success(message);
        } else {
            // Fallback for non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                toast.success(message);
            } catch (err) {
                console.error('Fallback copy failed', err);
                toast.error('Failed to copy. Please copy manually.');
            }
            
            document.body.removeChild(textArea);
        }
    } catch (err) {
        console.error('Clipboard copy failed', err);
        toast.error('Failed to copy. Please copy manually.');
    }
};

/**
 * Shares text/url using the Web Share API
 */
export const shareContent = async (shareData: ShareData) => {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('Share failed', err);
            }
        }
    } else {
        // Fallback: Copy to clipboard if sharing is not supported
        if (shareData.url) {
            await copyToClipboard(shareData.url, 'Share link copied to clipboard!');
        }
    }
};
