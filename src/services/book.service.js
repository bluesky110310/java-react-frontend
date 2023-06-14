import http from "../http-common";

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const getAllBooks = () => http.get("/books");
    const getBookById = id => http.get(`/books/${id}`);
    const createBook = data => http.post("/books", data);
    const updateBook = (id, data) => http.put(`/books/${id}`, data);
    const deleteBook = id => http.delete(`/books/${id}`);

    return {
        getAllBooks,
        getBookById,
        createBook,
        updateBook,
        deleteBook
    };
};