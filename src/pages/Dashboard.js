import * as React from 'react';
import {
  DataGrid,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import {
  Button,
  TextField,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import ReactPlayer from 'react-player';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import UndoIcon from '@mui/icons-material/Undo';
import './data.css';
import axios from 'axios'

const useStyles = makeStyles({
  wrapText: {
    whiteSpace: 'normal !important',
    wordWrap: 'break-word !important',
  },
});

const SpeechFile = ({ audioUrl }) => {
  const [playing, setPlaying] = React.useState(false);

  const togglePlaying = () => {
    setPlaying(!playing);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <IconButton color="primary" onClick={togglePlaying}>
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <ReactPlayer
        url={audioUrl}
        width="0px"
        height="0px"
        playing={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
};

const TtsOutpatch = ({ audioUrl }) => {
  const [playing, setPlaying] = React.useState(false);

  const togglePlaying = () => {
    setPlaying(!playing);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <IconButton color="primary" onClick={togglePlaying}>
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <ReactPlayer
        url={audioUrl}
        width="0px"
        height="0px"
        playing={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
};


export default function DataTable() {
  const classes = useStyles();
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loadedPages, setLoadedPages] = React.useState([]);
  
const columns = [
  {
    field: 'date',
    headerName: 'Date',
    width: 95,
    sortable: false,
  },
  {
    field: 'time',
    headerName: 'Time',
    width: 95,
    sortable: false,
  },
  {
    field: 'from_mobile',
    headerName: 'Caller-Number',
    width: 120,
    cellClassName: 'wrap-text',
    sortable: false,
  },
  {
    field: 'grade',
    headerName: 'Class',
    width: 60,
    sortable: false,
  },
  {
    field: 'subject',
    headerName: 'Subject',
    width: 70,
    sortable: false,
  },
  {
    field: 'audio_url',
    headerName: 'Speech File',
    width: 100,
    renderCell: (params) => <SpeechFile audioUrl={params.value} />,
    sortable: false,
  },
  {
    field: 'speechThumbs',
    headerName: 'speechThumbs',
    width: 120,
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          color={params.row.audio_quality_rate === 'up' ? 'primary' : 'default'}
          onClick={() => handleThumbsUp(params.row)}
        >
          <ThumbUpIcon />
        </IconButton>
        <IconButton
          color={params.row.audio_quality_rate === 'down' ? 'secondary' : 'default'}
          onClick={() => handleThumbsDown(params.row)}
        >
          <ThumbDownIcon />
        </IconButton>
      </div>
    ),
  },
  {
    field: 'original_asr',
    headerName: 'Asr Telugu Text',
    width: 250,
    headerClassName: 'wrap-text',
    cellClassName: 'wrap-text auto-expand',
    sortable: false,
  },
  {
    field: 'asrThumbs',
    headerName: 'AsrThumbs',
    width: 120,
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          color={params.row.asr_rate === 'up' ? 'primary' : 'default'}
          onClick={() => handleAsrThumbsUp(params.row)}
        >
          <ThumbUpIcon />
        </IconButton>
        <IconButton
          color={params.row.asr_rate === 'down' ? 'secondary' : 'default'}
          onClick={() => handleAsrThumbsDown(params.row)}
        >
          <ThumbDownIcon />
        </IconButton>
      </div>
    ),
  },
  {
    field: 'original_translation',
    headerName: 'MT English Text',
    width: 250,
    headerClassName: 'wrap-text',
    cellClassName: 'wrap-text auto-expand',
    sortable: false,
  },
  {
    field: 'mtThumbs',
    headerName: 'MTThumbs',
    width: 120,
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          color={params.row.mt_rate_eng === 'up' ? 'primary' : 'default'}
          onClick={() => handleMtThumbsUp(params.row)}
        >
          <ThumbUpIcon />
        </IconButton>
        <IconButton
          color={params.row.mt_rate_eng === 'down' ? 'secondary' : 'default'}
          onClick={() => handleMtThumbsDown(params.row)}
        >
          <ThumbDownIcon />
        </IconButton>
      </div>
    ),
  },
  {
    field: 'subtl_summ',
    headerName: 'Doc AI response',
    width: 250,
    headerClassName: 'wrap-text',
    cellClassName: 'wrap-text auto-expand',
    sortable: false,
  },
  {
    field: 'docAiThumbs',
    headerName: 'DocAiThumbs',
    width: 120,
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          color={params.row.subtl_answer_content_rate === 'up' ? 'primary' : 'default'}
          onClick={() => handleDocAiThumbsUp(params.row)}
        >
          <ThumbUpIcon />
        </IconButton>
        <IconButton
          color={params.row.subtl_answer_content_rate === 'down' ? 'secondary' : 'default'}
          onClick={() => handleDocAiThumbsDown(params.row)}
        >
          <ThumbDownIcon />
        </IconButton>
      </div>
    ),
  },
  {
    field: 'subtl_summ_vern',
    headerName: 'MT Text Telugu',
    width: 250,
    headerClassName: 'wrap-text',
    cellClassName: 'wrap-text auto-expand',
    sortable: false,
  },
  {
    field: 'mtTeluguThumbs',
    headerName: 'MTTeluguThumbs',
    width: 120,
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        color={params.row.mt_rate_tel === 'up' ? 'primary' : 'default'}
        onClick={() => handleMtTeluguThumbsUp(params.row)}
      >
        <ThumbUpIcon />
      </IconButton>
      <IconButton
        color={params.row.mt_rate_tel === 'down' ? 'secondary' : 'default'}
        onClick={() => handleMtTeluguThumbsDown(params.row)}
      >
        <ThumbDownIcon />
      </IconButton>
    </div>
    ),
  },
  {
    field: 'subtl_summ_vern_audio_url',
    headerName: 'TTS outpatch',
    width: 100,
    cellClassName: 'wrap-text',
    renderCell: (params) => <TtsOutpatch audioUrl={params.value} />,
    sortable: false,
  },
  {
    field: 'ttsOutpatchThumbs',
    headerName: 'TTSOutpatchThumbs',
    width: 120, 
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          color={params.row.tts_rate === 'up' ? 'primary' : 'default'}
          onClick={() => handleTtsOutpatchThumbsUp(params.row)}
        >
          <ThumbUpIcon />
        </IconButton>
        <IconButton
          color={params.row.tts_rate === 'down' ? 'secondary' : 'default'}
          onClick={() => handleTtsOutpatchThumbsDown(params.row)}
        >
          <ThumbDownIcon />
        </IconButton>
      </div>
    ),
  }, 
];
const handleThumbsUp = async (row) => {
  try {
    const updatedFields = {
      ...row,
      audio_quality_rate: 'up',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`Thumbs Up clicked for ID: ${row.id}, Name: ${row.audio_url}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleThumbsDown = async (row) => {
  try {
    const updatedFields = {
      ...row,
      audio_quality_rate: 'down',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`Thumbs Down clicked for ID: ${row.id}, Name: ${row.audio_url}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleAsrThumbsUp = async (row) => {
  try {
    const updatedFields = {
      ...row,
      asr_rate: 'up',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`Asr Thumbs Up clicked for ID: ${row.id}, Name: ${row.original_asr}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleAsrThumbsDown = async (row) => {
  try {
    const updatedFields = {
      ...row,
      asr_rate: 'down',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`Asr Thumbs Down clicked for ID: ${row.id}, Name: ${row.original_asr}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleMtThumbsUp = async (row) => {
  try {
    const updatedFields = {
      ...row,
      mt_rate_eng: 'up',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`MT Thumbs Up clicked for ID: ${row.id}, Name: ${row.original_translation}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleMtThumbsDown = async (row) => {
  try {
    const updatedFields = {
      ...row,
      mt_rate_eng: 'down',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`MT Thumbs Down clicked for ID: ${row.id}, Name: ${row.original_translation}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleMtTeluguThumbsUp = async (row) => {
  try {
    const updatedFields = {
      ...row,
      mt_rate_tel: 'up',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`MT Telugu Thumbs Up clicked for ID: ${row.id}, Name: ${row.mt_rate_tel}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleMtTeluguThumbsDown = async (row) => {
  try {
    const updatedFields = {
      ...row,
      mt_rate_tel: 'down',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`MT Telugu Thumbs Down clicked for ID: ${row.id}, Name: ${row.mt_rate_tel}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleDocAiThumbsUp = async (row) => {
  try {
    const updatedFields = {
      ...row,
      subtl_answer_content_rate: 'up',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`Doc AI Thumbs Up clicked for ID: ${row.id}, Name: ${row.subtl_summ_vern}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleDocAiThumbsDown = async (row) => {
  try {
    const updatedFields = {
      ...row,
      subtl_answer_content_rate: 'down',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`Doc AI Thumbs Down clicked for ID: ${row.id}, Name: ${row.subtl_summ_vern}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleTtsOutpatchThumbsUp = async (row) => {
  try {
    const updatedFields = {
      ...row,
      tts_rate: 'up',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`TTS Outpatch Thumbs Up clicked for ID: ${row.id}, Name: ${row.subtl_summ_vern_audio_url}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};

const handleTtsOutpatchThumbsDown = async (row) => {
  try {
    const updatedFields = {
      ...row,
      tts_rate: 'down',
    };

    await axios.patch(`https://pl-app.iiit.ac.in/questions/${row.id}`, updatedFields);

    const newData = data.map((item) => (item.id === row.id ? { ...item, ...updatedFields } : item));
    setData(newData);

    console.log(`TTS Outpatch Thumbs Down clicked for ID: ${row.id}, Name: ${row.subtl_summ_vern_audio_url}`);
  } catch (error) {
    console.error('Error updating fields:', error);
  }
};


const fetchData = async (page, maxPages) => {
  if (page > maxPages) {
    return;
  }

  // Generate a unique cache-busting query parameter
  const cacheBuster = Date.now();

  const apiUrl = `https://pl-app.iiit.ac.in/questions/answers/correct`;
  const params = {
    page,
    size: 100,
    rated: false,
    _cb: cacheBuster, // Add the cache-buster to the query parameters
  };
  const response = await fetch(`${apiUrl}?${new URLSearchParams(params)}`);
  const result = await response.json();
  const formattedData = result.items.map((item) => {
    const timestamp = new Date(item.timestamp);
    const day = timestamp.getDate().toString().padStart(2, '0');
    const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
    const year = timestamp.getFullYear();
    const date = `${day}/${month}/${year}`;
    return {
      ...item,
      date,
      time: timestamp.toLocaleTimeString(),
      speechThumbs: item.audio_quality_rate === 'up' ? 'Up' : item.audio_quality_rate === 'down' ? 'Down' : 'Neutral',
      asrThumbs: item.asr_rate === 'up' ? 'Up' : item.asr_rate === 'down' ? 'Down' : 'Neutral',
      mtThumbs: item.mt_rate_eng === 'up' ? 'Up' : item.mt_rate_eng === 'down' ? 'Down' : 'Neutral',
      mtTeluguThumbs: item.mt_rate_tel === 'up' ? 'Up' : item.mt_rate_tel === 'down' ? 'Down' : 'Neutral',
      docAiThumbs: item.subtl_answer_content_rate === 'up' ? 'Up' : item.subtl_answer_content_rate === 'down' ? 'Down' : 'Neutral',
      ttsOutpatchThumbs: item.tts_rate === 'up' ? 'Up' : item.tts_rate === 'down' ? 'Down' : 'Neutral',
    };
  });
  setData((prevData) => {
    const mergedData = [...prevData, ...formattedData];
    // Remove duplicates based on ID
    return mergedData.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    );
  });
  setLoading(false);
  if (result.items.length === 0) {
    return;
  }
  await fetchData(page + 1, maxPages);
  
};

React.useEffect(() => {
  fetchData(1, 100000).catch((error) => console.error(error));
}, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ height: "100%", width: '95%', justifyContent: 'center', alignItems: 'center', marginRight: '5vw' }}>
        <DataGrid
          rows={data}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          disableColumnMenu
          getRowHeight={() => 'auto'}
          slots={{ toolbar: GridToolbar, export: GridToolbarExport, container: GridToolbarContainer }}
        />
      </div>
    </div>
  );
}