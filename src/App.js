import React, { useState, useRef, useEffect } from 'react';
import {
  TextField, Button, Typography, Paper, Container, Grid, Avatar, CircularProgress,
  useMediaQuery, CssBaseline
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/system';

const theme = createTheme({
  palette: {
    background: {
      default: 'linear-gradient(145deg, #e6e9f0, #eef1f5)',
    },
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#ffa34d', // Orange color for user messages
    },
    text: {
      primary: '#2e2e2e',
      secondary: '#575757',
    },
  },
  shape: {
    borderRadius: 15,
  },
  shadows: ['none', '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)'],
});

const ChatContainer = styled(Container)(({ theme }) => ({
  height: '90vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '2rem',
  backgroundColor: theme.palette.background.default,
}));

const MessageContainer = styled(Paper)(({ theme }) => ({
  maxWidth: '100%',
  padding: '12px 18px',
  marginBottom: '12px',
  backgroundColor: theme.palette.common.white,
}));

const UserBubble = styled(MessageContainer)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main, // Orange background for user messages
}));

const BotBubble = styled(MessageContainer)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const MessageLabel = styled(Typography)(({ theme, type }) => ({
  fontWeight: 'bold',
  color: type === 'user' ? theme.palette.getContrastText(theme.palette.secondary.main) : theme.palette.primary.main,
  marginBottom: '4px',
}));

const MessageText = styled(Typography)({
  wordWrap: 'break-word',
});

function makeTextClickable(text) {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
    }
    return part;
  });
}

function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearch = async () => {
    setChat((prevChat) => [...prevChat, { type: 'user', text: [searchQuery] }]);
    setIsLoading(true);
  
    try {
      const response = await fetch('https://tsearch-c7q4.onrender.com/tsearch/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search_query: searchQuery }),
      });
  
      if (!response.ok) {
        throw new Error('Response not OK');
      }
  
      const textContent = await response.text();
      const paragraphs = textContent.split('\n').filter(paragraph => paragraph.trim() !== '');

      setChat((prevChat) => [
        ...prevChat,
        { type: 'bot', text: paragraphs.length > 0 ? paragraphs : ['No response received.'] },
      ]);
    } catch (error) {
      console.error("Error:", error.message);
      setChat((prevChat) => [
        ...prevChat,
        { type: 'bot', text: ['Sorry, there was an error processing your request.'] },
      ]);
    } finally {
      setIsLoading(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatContainer maxWidth="md">
        <Typography variant="h5" align="center" gutterBottom style={{ color: theme.palette.text.primary }}>
          GTSearch
        </Typography>
        <div style={{ overflowY: 'scroll', flexGrow: 1 }}>
          {chat.map((message, index) => (
            <div key={index} ref={chatEndRef}>
              <MessageLabel type={message.type}>{message.type === 'user' ? 'You' : 'GTSearch'}</MessageLabel>
              {message.type === 'user' ? (
                <UserBubble>
                  {message.text.map((p, idx) => (
                    <MessageText key={idx}>{makeTextClickable(p)}</MessageText>
                  ))}
                </UserBubble>
              ) : (
                <BotBubble>
                  {message.text.map((p, idx) => (
                    <MessageText key={idx}>{makeTextClickable(p)}</MessageText>
                  ))}
                </BotBubble>
              )}
            </div>
          ))}
          {isLoading && (
            <MessageContainer style={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} />
              <MessageText style={{ marginLeft: '10px' }}>Searching...</MessageText>
            </MessageContainer>
          )}
        </div>
        <Grid container spacing={2} alignItems="center" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `2px solid ${theme.palette.divider}` }}>
          <Grid item xs={isMobile ? 8 : 9}>
            <TextField
              fullWidth
              variant="outlined"
              label="Type your search query here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                style: {
                  backgroundColor: theme.palette.common.white,
                }
              }}
            />
          </Grid>
          <Grid item xs={isMobile ? 4 : 3}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isLoading}
            >
              Search
            </Button>
          </Grid>
        </Grid>
        <Typography variant="body2" style={{ color: theme.palette.text.secondary, fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
          GTSearch is prone to errors and may present inaccurate information. It's wise to verify its responses for accuracy, especially when dealing with crucial information.
        </Typography>
      </ChatContainer>
    </ThemeProvider>
  );
}

export default SearchComponent;
