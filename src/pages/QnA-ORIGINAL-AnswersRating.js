import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import TranslateIcon from "@mui/icons-material/Translate";
import Skeleton from "@mui/material/Skeleton";

import axios from "axios";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import UndoIcon from "@mui/icons-material/Undo";

import { Modal } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const AudioPlayer = ({ audioUrl, clr }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePlay = () => {
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  return (
    <div>
      <IconButton color={clr} onClick={isPlaying ? handlePause : handlePlay}>
        {isPlaying ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
      </IconButton>
      <audio
        src={audioUrl}
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

const Row = ({ row, onDelRow }) => {
  const [open, setOpen] = useState(false);
  const [english, setEnglish] = useState(false);
  const [rating, setRating] = useState();

  const handleUndo = async () => {
    console.log("Undo");
    await axios
      .patch(
        `https://pl-app.iiit.ac.in/answers/${row.answers[0].id}/rate`,
        { rate: "neutral" }
      )
      .then((res) => {
        console.log(res);
        row.answers[0] = res.data;
      });
    setRating("Neutral");
  };

  const handleUp = async () => {
    console.log("Up");
    await axios
      .patch(
        `https://pl-app.iiit.ac.in/answers/${row.answers[0].id}/rate`,
        { rate: "up" }
      )
      .then((res) => {
        console.log(res);
        row.answers[0] = res.data;
      });
    setRating("Up");
    onDelRow(row.id);
  };

  const handleDown = async () => {
    console.log("Down");
    await axios
      .patch(
        `https://pl-app.iiit.ac.in/answers/${row.answers[0].id}/rate`,
        { rate: "down" }
      )
      .then((res) => {
        console.log(res);
        row.answers[0] = res.data;
      });
    setRating("Down");
    onDelRow(row.id);
  };

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">
          {<AudioPlayer audioUrl={row.audio_url} clr={"success"} />}
        </TableCell>
        <TableCell component="th" variant="subtitle1" scope="row">
          {row.asr}
        </TableCell>
        <TableCell align="right">{row.subject}</TableCell>
        <TableCell align="right">{row.grade}</TableCell>
        <TableCell align="right">
          {new Date(row.timestamp).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            hour12: true,
          })}
        </TableCell>
        <TableCell align="right">{row.type}</TableCell>
        <TableCell align="right">
          <>
            <Box>
              {row.answers[0].rate === "neutral" && (
                <IconButton
                  color="success"
                  aria-label="expand row"
                  size="small"
                  onClick={() => handleUp()}
                >
                  <ThumbUpOffAltIcon />
                </IconButton>
              )}
              {row.answers[0].rate === "up" && <ThumbUpAltIcon color="success" />}
              {row.answers[0].rate === "down" && (
                <IconButton
                  color="info"
                  aria-label="expand row"
                  size="small"
                  onClick={() => handleUndo()}
                >
                  <UndoIcon />
                </IconButton>
              )}
            </Box>
            <Box>
              {row.answers[0].rate === "neutral" && (
                <IconButton
                  color="error"
                  aria-label="expand row"
                  size="small"
                  onClick={() => handleDown()}
                >
                  <ThumbDownOffAltIcon />
                </IconButton>
              )}
              {row.answers[0].rate === "up" && (
                <IconButton
                  color="info"
                  aria-label="expand row"
                  size="small"
                  onClick={() => handleUndo()}
                >
                  <UndoIcon />
                </IconButton>
              )}
              {row.answers[0].rate === "down" && (
                <ThumbDownAltIcon color="error" />
              )}
            </Box>
          </>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Grid container spacing={1}>
              <Grid items xs={0.5} align="right">
                <Box sx={{ margin: 1 }}>
                  {!english ? (
                    <AudioPlayer
                      audioUrl={row.answers[0].telugu_audio}
                      clr={"error"}
                    />
                  ) : (
                    <></>
                  )}
                </Box>
              </Grid>
              <Grid items xs={10}>
                <Box sx={{ margin: 1 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    component="div"
                  >
                    <b style={{ color: "#006666" }}>Q.</b>{" "}
                    {english ? row.translation : row.asr}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    component="div"
                  >
                    <b style={{ color: "#EE2E31" }}>A.</b>{" "}
                    {english
                      ? row.answers[0].english_text
                      : row.answers[0].telugu_text}
                  </Typography>
                </Box>
              </Grid>
              <Grid items xs={1} align="right">
                <Box sx={{ margin: 1 }}>
                  <IconButton
                    color="info"
                    aria-label="expand row"
                    size="small"
                  >
                    <TranslateIcon onClick={() => setEnglish(!english)} />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const QnA = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [noData, setNoData] = useState(false);
  const [records, setRecords] = useState(0);

  const handleRemoveRow = (Qid) => {
    const rows = [...this.state.rows];
    const index = rows.findIndex((row) => row.id === Qid);
    rows.splice(index, 1);
    this.setState({ rows });
  };

  useEffect(() => {
    axios
      .get(
        `https://pl-app.iiit.ac.in/questions/answers/correct?page=${page}&size=25&rated=false`
      )
      .then((res) => {
        if (res.status === 200) {
          if (res.data.items.length > 0) {
            console.log(res);
            if (page === 1) {
              setRecords(res.data.total);
              setRows(res.data.items);
            } else {
              setRows((old) => [...old, ...res.data.items]);
            }
          } else if (res.data.items.length === 0 && page > 1) {
            setNoData(true);
          }
        }
      });
  }, [page]);

  const handleModalClose = () => {
    setNoData(false);
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="caption" display="block" gutterBottom align="right">
        {Math.ceil(records / 25) === 0 ? (
          <></>
        ) : (
          <b>
            Page {page} of {Math.ceil(records / 25)}
          </b>
        )}
      </Typography>
      <Table stickyHeader aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="left">
              <b>Audio</b>
            </TableCell>
            <TableCell>
              <b>Question</b>
            </TableCell>
            <TableCell align="right">
              <b>Subject</b>
            </TableCell>
            <TableCell align="right">
              <b>Class</b>
            </TableCell>
            <TableCell align="right">
              <b>Date &amp; Time</b>
            </TableCell>
            <TableCell align="right">
              <b>Mode</b>
            </TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        {rows.length === 0 ? (
          <>
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Skeleton variant="rectangular" height={30} />{" "}
                </TableCell>
              </TableRow>
            </TableBody>
          </>
        ) : (
          <>
            <TableBody>
              {rows.map((row) => (
                <Row key={row.id} row={row} onDelRow={handleRemoveRow} />
              ))}
            </TableBody>
            <TableBody>
              <TableRow>
                <TableCell colSpan={12} align="center">
                  <Button fullWidth color="warning" onClick={() => setPage(page + 1)}>
                    Load more
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </>
        )}
      </Table>
      <Modal
        open={noData}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            No Data
          </Typography>
        </Box>
      </Modal>
    </TableContainer>
  );
};

export default QnA;