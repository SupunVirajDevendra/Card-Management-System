interface LoaderProps {
    cols?: number;
    rows?: number;
}

export default function Loader({ cols = 5, rows = 5 }: LoaderProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, ri) => (
                <tr key={ri} className="skeleton-row">
                    {Array.from({ length: cols }).map((_, ci) => (
                        <td key={ci}>
                            <div className="skeleton-cell" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
