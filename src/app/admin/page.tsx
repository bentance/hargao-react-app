import { notFound } from 'next/navigation';

export default function FakeAdminPage() {
    // This page always returns 404
    notFound();
}
