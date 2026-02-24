import '@testing-library/jest-dom/vitest';
import { EditBookComponent } from '@/components/admin/books/EditBook';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminService from '@/services/adminService';
import authorService from '@/services/authorService';

vi.mock('@/services/adminService', () => ({
  default: {
    getBookById: vi.fn(),
    updateBook: vi.fn(),
    deleteCoverUpload: vi.fn(),
    getUniqueGenres: vi.fn(),
  },
}));

vi.mock('@/services/authorService', () => ({
  default: {
    getAuthors: vi.fn(),
    createAuthor: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

const mockStore = configureStore([]);
const store = mockStore({});

describe('EditBookComponent (admin route)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // The EditBook form loads genre suggestions for autocomplete
    (AdminService.getUniqueGenres as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue([]);
  });

  it('renders loading state initially', async () => {
    (AdminService.getBookById as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ id: 1 }), 50)),
      );
    (authorService.getAuthors as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue([]);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/books/edit/1']}>
          <Routes>
            <Route
              path="/admin/books/edit/:id"
              element={<EditBookComponent />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(
      await screen.findByText(/Loading book details/i),
    ).toBeInTheDocument();
  });

  it('renders book form with data when loaded successfully', async () => {
    (AdminService.getBookById as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue({
        id: 1,
        title: 'Test Book',
        isbn: '1234567890',
        isbn10: '1234567890',
        isbn13: '9781234567897',
        publishYear: 2023,
        pages: 111,
        genre: 'Fiction',
        author: 'Author One',
        description: 'Test description',
        cover: 'https://example.com/test-cover.jpg',
        coverKey: 'cover_key_1',
        authors: [
          { id: 1, name: 'Author One', is_primary: true },
          { id: 2, name: 'Author Two', is_primary: false },
        ],
      });

    (authorService.getAuthors as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue([
        { id: 1, name: 'Author One' },
        { id: 2, name: 'Author Two' },
      ]);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/books/edit/1']}>
          <Routes>
            <Route
              path="/admin/books/edit/:id"
              element={<EditBookComponent />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(AdminService.getBookById).toHaveBeenCalledWith(1);
    });

    expect(await screen.findByDisplayValue('Test Book')).toBeInTheDocument();
    expect(
      screen.getAllByDisplayValue('1234567890').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByDisplayValue('9781234567897')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023')).toBeInTheDocument();
    expect(screen.getByDisplayValue('111')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();

    expect(screen.getByText('Author One')).toBeInTheDocument();
    expect(screen.getByText('Author Two')).toBeInTheDocument();
  });

  it('navigates away when fetching book details fails', async () => {
    (AdminService.getBookById as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockRejectedValue(new Error('API Error'));
    (authorService.getAuthors as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue([]);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/books/edit/1']}>
          <Routes>
            <Route
              path="/admin/books/edit/:id"
              element={<EditBookComponent />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/books');
    });
  });

  it('submits updated book data when form is submitted', async () => {
    (AdminService.getBookById as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue({
        id: 1,
        title: 'Original Title',
        isbn: '1234567890',
        publishYear: 2022,
        description: 'Original description',
        cover: '',
        coverKey: '',
        authors: [{ id: 1, name: 'Original Author', is_primary: true }],
      });

    (authorService.getAuthors as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue([{ id: 1, name: 'Original Author' }]);

    (AdminService.updateBook as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue({ id: 1, title: 'Updated Title' });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/books/edit/1']}>
          <Routes>
            <Route
              path="/admin/books/edit/:id"
              element={<EditBookComponent />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(AdminService.getBookById).toHaveBeenCalledWith(1);
    });

    const titleInput = await screen.findByDisplayValue('Original Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    const saveButton = await screen.findByRole('button', {
      name: /Save Changes/i,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(AdminService.updateBook).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ title: 'Updated Title' }),
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/books/view/1');
    });
  });

  it('removes an author from the list', async () => {
    (AdminService.getBookById as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue({
        id: 1,
        title: 'Test Book',
        authors: [
          { id: 1, name: 'First Author', is_primary: true },
          { id: 2, name: 'Second Author', is_primary: false },
        ],
      });

    (authorService.getAuthors as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue([
        { id: 1, name: 'First Author' },
        { id: 2, name: 'Second Author' },
      ]);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/books/edit/1']}>
          <Routes>
            <Route
              path="/admin/books/edit/:id"
              element={<EditBookComponent />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(await screen.findByText('First Author')).toBeInTheDocument();
    expect(screen.getByText('Second Author')).toBeInTheDocument();

    const removeButtons = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('title') === 'Remove author');

    expect(removeButtons.length).toBeGreaterThan(0);
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('First Author')).not.toBeInTheDocument();
      expect(screen.getByText('Second Author')).toBeInTheDocument();
    });
  });

  it('does not repeatedly refetch book details (StrictMode regression)', async () => {
    (AdminService.getBookById as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue({
        id: 1,
        title: 'Test Book',
        cover: '',
        coverKey: '',
        authors: [],
      });

    (authorService.getAuthors as unknown as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue([]);

    render(
      <StrictMode>
        <Provider store={store}>
          <MemoryRouter initialEntries={['/admin/books/edit/1']}>
            <Routes>
              <Route
                path="/admin/books/edit/:id"
                element={<EditBookComponent />}
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(AdminService.getBookById).toHaveBeenCalled();
    });

    // StrictMode may double-mount components in dev; this should never loop.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(AdminService.getBookById).toHaveBeenCalledWith(1);
    expect(
      (AdminService.getBookById as unknown as ReturnType<typeof vi.fn>).mock
        .calls.length,
    ).toBeLessThanOrEqual(2);
    expect(
      (authorService.getAuthors as unknown as ReturnType<typeof vi.fn>).mock
        .calls.length,
    ).toBeLessThanOrEqual(2);
  });
});
