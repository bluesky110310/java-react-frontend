import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Row } from "react-bootstrap";
import DateRangePicker from "react-bootstrap-daterangepicker";
import api from "../services/book.service";

import "bootstrap-daterangepicker/daterangepicker.css";

function Book() {
  const currentDate = new Date().toLocaleDateString(["en-CA", "en-US"]);
  const initialBook = {
    property: 1,
    start: currentDate,
    end: currentDate,
  };

  const [books, setBooks] = useState([]);
  const [show, setShow] = useState(false);
  const [book, setBook] = useState(initialBook);
  const [validated, setValidated] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setBook(initialBook);
  };

  const handleChangeProperty = (event) => {
    setBook({ ...book, property: event.target.value });
  };

  const handleCallback = (start, end) => {
    setBook({
      ...book,
      start: start.format("YYYY-MM-DD"),
      end: end.format("YYYY-MM-DD"),
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
    } else {
      setValidated(true);
      // eslint-disable-next-line no-restricted-globals
      if (confirm("Do you really " + (book.id ? "reschedule" : "create") + " this book?")) {
        createBook();
      }
    }
  };

  const getAllBooks = () => {
    api()
      .getAllBooks()
      .then((resp) => {
        setBooks(resp.data === "" ? [] : resp.data);
      });
  };

  const createBook = () => {
    if (book.id) {
      api()
        .updateBook(book.id, book)
        .then((resp) => {
          handleClose();
          getAllBooks();
        });
    } else {
      api()
        .createBook(book)
        .then((resp) => {
          handleClose();
          getAllBooks();
        })
        .catch((resp) => {
          const { status } = resp.response;
          if (status === 409) {
            alert(
              "This property is already booked, or blocked by owner between " +
                book.start +
                " and " +
                book.end +
                ".\nPlease change the property or date range."
            );
          }
        });
    }
  };

  const updateBook = (id) => {
    api()
      .getBookById(id)
      .then((resp) => {
        setBook(resp.data);
        handleShow();
      });
  };

  const cancelBook = (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Do you really cancel this book?")) {
      api()
        .deleteBook(id)
        .then((resp) => {
          getAllBooks();
        });
    }
  };

  useEffect(() => {
    getAllBooks();
  }, []);

  return (
    <div className="container mt-3">
      <div className="mb-3 text-end">
        <Button variant="primary" onClick={handleShow}>
          Book
        </Button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Property</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th className="text-center" width="220">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr className="text-center">
              <td colSpan={5}>No Books</td>
            </tr>
          ) : (
            books.map((book, index) => (
              <tr key={book.id}>
                <td>{index + 1}</td>
                <td>{book.property}</td>
                <td>{book.start}</td>
                <td>{book.end}</td>
                <td className="text-center">
                  <Button
                    variant="success"
                    className="me-2"
                    size="sm"
                    onClick={() => updateBook(book.id)}
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => cancelBook(book.id)}
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {book.id ? "Reschedule Booking" : "Create Booking"}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group controlId="validationCustomProperty">
                <Form.Label>Property</Form.Label>
                <Form.Control
                  required
                  type="number"
                  value={book.property}
                  placeholder="Input the property number"
                  min="1"
                  max="100"
                  onChange={handleChangeProperty}
                />
              </Form.Group>
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Row>
            <Row className="mb-3">
              <Form.Group controlId="validationCustomDateRange">
                <Form.Label>Date Range</Form.Label>
                <DateRangePicker
                  initialSettings={{
                    startDate: book.start,
                    endDate: book.end,
                    locale: {
                      format: "YYYY-MM-DD",
                      separator: " ~ ",
                    },
                  }}
                  onCallback={handleCallback}
                >
                  <Form.Control required type="text" />
                </DateRangePicker>
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              {book.id ? "Reschedule" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Book;
