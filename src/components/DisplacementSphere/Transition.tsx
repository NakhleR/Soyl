
import React, { useRef, useEffect, useState } from 'react';

interface TransitionProps {
    in: boolean;
    timeout: number;
    nodeRef: React.RefObject<any>;
    children: (props: { visible: boolean; nodeRef: React.RefObject<any> }) => React.ReactNode;
}

export const Transition: React.FC<TransitionProps> = ({
    in: inProp,
    timeout,
    children,
    nodeRef,
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (inProp) {
            const timeoutId = setTimeout(() => {
                setVisible(true);
            }, 0);
            return () => clearTimeout(timeoutId);
        } else {
            setVisible(false);
        }
    }, [inProp]);

    return <>{children({ visible, nodeRef })}</>;
};