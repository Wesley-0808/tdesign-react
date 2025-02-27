import React from 'react';
import { render, act, fireEvent, waitFor, vi, mockTimeout, mockDelay } from '@test/utils';
import userEvent from '@testing-library/user-event';

import { ImageViewer } from '../index';

const imgUrl = 'https://tdesign.gtimg.com/demo/demo-image-1.png';
const imgUrl2 = 'https://tdesign.gtimg.com/demo/demo-image-2.png';
// const errorImgUrl = 'https://tdesixxxxxxxxgn.gtimg.com/demo/demo-image-1.png';

describe('ImageViewer', () => {
  const triggerText = '预览单张图片';

  test('base', async () => {
    const onClose = vi.fn();
    const BasicImageViewer = () => {
      const trigger = ({ onOpen }) => <span onClick={onOpen}>{triggerText}</span>;
      return <ImageViewer trigger={trigger} images={[imgUrl]} onClose={onClose} />;
    };
    const { getByText } = render(<BasicImageViewer />);

    // 点击前，没有元素存在
    const imgContainer = document.querySelector('.t-image-viewer-preview-image');
    expect(imgContainer).toBeNull();

    // 模拟鼠标点击
    act(() => {
      fireEvent.click(getByText(triggerText));
    });

    // 鼠标点击后，有元素
    expect(onClose).toHaveBeenCalledTimes(0);
    const imgModal = document.querySelector('.t-image-viewer__modal-pic');
    expect(imgModal).toBeTruthy();

    // 模拟鼠标点击关闭
    const closeBtn = document.querySelector('.t-image-viewer__modal-close-bt');
    act(() => {
      fireEvent.click(closeBtn);
    });
    // 点击后，没有元素存在
    expect(onClose).toHaveBeenCalledTimes(1);
    await mockTimeout(() => expect(document.querySelector('.t-image-viewer-preview-image')).toBeNull());
  });

  test('base:trigger is not Fn', async () => {
    const BasicImageViewer = () => {
      const trigger = <span>{triggerText}</span>;
      return <ImageViewer trigger={trigger} />;
    };
    const { getByText } = render(<BasicImageViewer />);
    expect(getByText(triggerText)).toBeTruthy();
  });

  test('base:attach is default=body', async () => {
    const BasicImageViewer = () => {
      const trigger = ({ open }) => <span onClick={open}>{triggerText}</span>;
      return <ImageViewer trigger={trigger} images={[imgUrl]} />;
    };
    const { getByText } = render(<BasicImageViewer />);

    // 点击前，没有元素存在
    const imgContainer = document.body.querySelector('.t-image-viewer-preview-image');
    expect(imgContainer).toBeNull();

    // 模拟鼠标点击
    act(() => {
      fireEvent.click(getByText(triggerText));
    });

    // 鼠标点击后，有元素
    const imgModal = document.body.querySelector('.t-image-viewer__modal-pic');
    expect(imgModal).toBeTruthy();
  });

  test('base:attach is function', async () => {
    const BasicImageViewer = () => {
      const trigger = ({ open }) => <span onClick={open}>{triggerText}</span>;
      return <ImageViewer trigger={trigger} images={[imgUrl]} attach={() => document.body} />;
    };
    const { getByText } = render(<BasicImageViewer />);

    // 点击前，没有元素存在
    const imgContainer = document.body.querySelector('.t-image-viewer-preview-image');
    expect(imgContainer).toBeNull();

    // 模拟鼠标点击
    act(() => {
      fireEvent.click(getByText(triggerText));
    });

    act(() => {
      // 鼠标点击后，有元素
      const imgModal = document.body.querySelector('.t-image-viewer__modal-pic');
      expect(imgModal).toBeTruthy();
    });
  });
});

describe('ImageViewerMini', () => {
  const triggerText = '预览单张图片';

  test('modeless', async () => {
    const onClose = vi.fn();
    const BasicImageViewer = () => {
      const trigger = ({ onOpen }) => <span onClick={onOpen}>{triggerText}</span>;
      return <ImageViewer trigger={trigger} images={[imgUrl]} onClose={onClose} mode="modeless" />;
    };
    const { getByText } = render(<BasicImageViewer />);

    // 模拟鼠标点击
    act(() => {
      fireEvent.click(getByText(triggerText));
    });

    // 鼠标点击后，有 mini 元素
    const miniFooter = await waitFor(() => document.querySelector('.t-image-viewer-mini__footer'));
    expect(miniFooter).toBeTruthy();

    // 模拟鼠标点击关闭
    const closeBtn = await waitFor(() => document.querySelector('.t-icon-close'));
    act(() => {
      fireEvent.click(closeBtn);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('ImageViewerModal', () => {
  const triggerText = '预览单张图片';
  test('base', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onIndexChange = vi.fn();
    const BasicImageViewer = () => {
      const trigger = ({ onOpen }) => <span onClick={onOpen}>{triggerText}</span>;
      return (
        <ImageViewer
          trigger={trigger}
          images={[imgUrl, imgUrl2]}
          onClose={onClose}
          onIndexChange={onIndexChange}
          closeOnOverlay={true}
        />
      );
    };
    const { getByText } = render(<BasicImageViewer />);

    // 模拟鼠标点击
    act(() => {
      fireEvent.click(getByText(triggerText));
    });

    // 模拟键盘事件
    await user.type(document.body, '{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.type(document.body, '{ArrowRight}');
    expect(onIndexChange).toHaveBeenCalledTimes(1);

    await user.type(document.body, '{ArrowLeft}');
    expect(onIndexChange).toHaveBeenCalledTimes(2);

    // 鼠标点击遮罩
    const mask = await waitFor(() => document.querySelector('.t-image-viewer__modal-mask'));
    act(() => {
      fireEvent.click(mask);
    });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('single', async () => {
    const user = userEvent.setup();
    const BasicImageViewer = () => {
      const trigger = ({ onOpen }) => <span onClick={onOpen}>{triggerText}</span>;
      return <ImageViewer trigger={trigger} images={[imgUrl]} />;
    };
    const { getByText } = render(<BasicImageViewer />);

    // 模拟鼠标点击
    act(() => {
      fireEvent.click(getByText(triggerText));
    });

    const img = document.querySelector('.t-image-viewer__modal-image');
    expect(getComputedStyle(img).transform).toBe('rotateZ(0deg) scale(1)');

    await user.type(document.body, '{ArrowUp}');
    expect(getComputedStyle(img).transform).toBe('rotateZ(0deg) scale(1.5)');

    await user.type(document.body, '{ArrowDown}');
    expect(getComputedStyle(img).transform).toBe('rotateZ(0deg) scale(1)');

    const rotateIcon = await waitFor(() => document.querySelector('.t-icon-rotation'));
    // 模拟鼠标点击
    act(() => {
      fireEvent.click(rotateIcon);
    });
    expect(getComputedStyle(img).transform).toBe('rotateZ(-90deg) scale(1)');

    const resetIcon = await waitFor(() => document.querySelector('.t-icon-image'));
    // 模拟鼠标点击
    act(() => {
      fireEvent.click(resetIcon);
    });
    expect(getComputedStyle(img).transform).toBe('rotateZ(0deg) scale(1)');
  });

  test('closeBtn', async () => {
    const BasicImageViewer = () => {
      const trigger = ({ onOpen }) => <span onClick={onOpen}>{triggerText}</span>;
      return <ImageViewer trigger={trigger} images={[imgUrl]} closeBtn={() => <span>closeBtn</span>} />;
    };
    const { getByText } = render(<BasicImageViewer />);

    // 模拟鼠标点击
    act(() => {
      fireEvent.click(getByText(triggerText));
    });
    expect(getByText('closeBtn')).toBeTruthy();
  });

  test('closeOnEscKeydown is false', async () => {
    const user = userEvent.setup();
    const BasicImageViewer = () => {
      const trigger = ({ onOpen }) => <span onClick={onOpen}>{triggerText}</span>;
      return <ImageViewer trigger={trigger} images={[imgUrl, imgUrl2]} closeOnEscKeydown={false} />;
    };
    const { getByText } = render(<BasicImageViewer />);

    // 模拟鼠标点击
    act(() => {
      fireEvent.click(getByText(triggerText));
    });
    expect(document.querySelector('.t-image-viewer-preview-image')).toBeInTheDocument();

    // 模拟键盘事件
    await user.type(document.body, '{Escape}');
    await mockDelay(300);
    expect(document.querySelector('.t-image-viewer-preview-image')).toBeInTheDocument();
  });

  test('imageScale defaultScale', async () => {
    const BasicImageViewer = () => {
      const trigger = ({ onOpen }) => <span onClick={onOpen}>{triggerText}</span>;
      return (
        <ImageViewer
          trigger={trigger}
          images={[imgUrl, imgUrl2]}
          imageScale={{
            max: 2,
            min: 0.5,
            step: 0.5,
            defaultScale: 2,
          }}
        />
      );
    };
    const { getByText } = render(<BasicImageViewer />);

    // 模拟鼠标点击
    act(() => {
      fireEvent.click(getByText(triggerText));
    });

    await mockDelay();

    expect(document.querySelector('.t-image-viewer__modal-image')).toBeInTheDocument();
    expect(document.querySelector('.t-image-viewer__modal-image')).toHaveStyle({
      transform: 'rotateZ(0deg) scale(2)',
    });
  });

  test('imageReferrerpolicy', async () => {
    const referrerPolicy = 'strict-origin-when-cross-origin';

    const BasicImageViewer = () => {
      const trigger = ({ onOpen }) => <span onClick={onOpen}>{triggerText}</span>;
      return <ImageViewer trigger={trigger} images={[imgUrl, imgUrl2]} imageReferrerpolicy={referrerPolicy} />;
    };
    const { getByText } = render(<BasicImageViewer />);

    // 模拟鼠标点击
    act(() => {
      fireEvent.click(getByText(triggerText));
    });

    await mockDelay();

    expect(document.querySelector('.t-image-viewer__modal-image')?.getAttribute('referrerpolicy')).toBe(referrerPolicy);
  });
});
