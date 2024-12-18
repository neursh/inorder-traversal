import { useHookstate } from '@hookstate/core';
import { motion } from 'framer-motion';
import { forwardRef, MutableRefObject, useEffect, useRef } from 'react';
import Context from '../context';
import { useScreen } from '../hooks/screen';

const Settings = forwardRef<HTMLElement>((_, container) => {
  container = container as MutableRefObject<HTMLElement>;

  const pathCache = useRef<string[]>([]);

  const containerReceived = useHookstate(false);
  const open = useHookstate(true);
  const updating = useHookstate(false);

  const input = useRef<HTMLTextAreaElement>(null);
  const findNodeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (updating.get()) {
      pathCache.current = [];
    }
  }, [updating]);

  useEffect(() => {
    if (container.current) {
      containerReceived.set(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container.current]);

  const screen = useScreen();

  if (containerReceived.get()) {
    return (
      <section className="fixed top-0 right-0">
        <motion.div
          className="flex items-center"
          initial={{ translateX: 0 }}
          animate={{
            translateX: open.get() ? 0 : screen.width >= 640 ? 384 : 240,
          }}
          transition={{
            ease: [0.5, 0.5, 0, 1],
            duration: 0.5,
          }}
        >
          <div
            className="w-8 h-8 rounded-full outline outline-2 outline-slate-300 flex items-center justify-center cursor-pointer backdrop-blur-lg bg-white bg-opacity-50"
            onClick={() => open.set((p) => !p)}
          >
            <motion.svg
              className="w-6 h-6"
              viewBox="0 -960 960 960"
              fill="#434343"
              initial={{ rotate: 0 }}
              animate={{
                rotate: open.get() ? 0 : 180,
              }}
              transition={{
                ease: [0.5, 0.5, 0, 1],
                duration: 0.5,
              }}
            >
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
            </motion.svg>
          </div>
          <motion.div
            className="relative sm:w-96 w-60 h-48 m-2 p-2 rounded-lg outline outline-2 outline-slate-300 backdrop-blur-lg bg-white bg-opacity-50 flex flex-col"
            initial={{ height: 192 }}
            animate={{ height: open.get() ? 192 : 96 }}
            transition={{
              ease: [0.5, 0.5, 0, 1],
              delay: open.get() ? 0 : 0.5,
              duration: 0.5,
            }}
          >
            <p className="font-semibold sm:text-base text-sm">Input:</p>
            <textarea
              ref={input}
              className="w-full h-[calc(100%-8px)] ml-1 mr-1 outline-none resize-none font-mono bg-transparent sm:text-base text-sm"
            />
            <div className="flex justify-between">
              <div className="flex justify-start">
                <p className="w-[120px] font-semibold sm:text-base text-sm">
                  Find node:
                </p>
                <input
                  ref={findNodeInput}
                  className="w-full bg-transparent outline-none sm:text-base text-sm"
                  onChange={() => {
                    const value = findNodeInput.current!.value;

                    if (pathCache.current.length !== 0 || value === '') {
                      pathCache.current.forEach((id) => {
                        const nodeAttributes =
                          Context.graph.getNodeAttributes(id);
                        nodeAttributes.color = 'black';
                      });

                      const nodeAttributes = Context.graph.getNodeAttributes(
                        pathCache.current[0]
                      );
                      nodeAttributes.color = 'red';

                      pathCache.current = [];
                    }

                    if (value !== '') {
                      pathCache.current = Context.tree.findValue(
                        parseFloat(value)
                      );

                      pathCache.current.forEach((id) => {
                        const nodeAttributes =
                          Context.graph.getNodeAttributes(id);
                        nodeAttributes.color = 'yellow';
                      });

                      const lastResult = value;
                      const actualNodePointed = Context.graph.getNodeAttributes(
                        pathCache.current.slice(-1)
                      );

                      if (actualNodePointed.label != lastResult) {
                        actualNodePointed.color = '#663399';
                      } else {
                        actualNodePointed.color = 'green';
                      }
                    }
                  }}
                />
              </div>
              <div className="h-6 min-w-[70px] flex justify-end">
                <motion.div
                  className="h-6 cursor-pointer rounded-full outline-dashed outline-1 text-center overflow-hidden flex items-center"
                  onClick={() => {
                    if (!updating.get()) {
                      updating.set(true);
                      Context.buildTree(input.current!.value);
                      setTimeout(() => updating.set(false), 1000);
                    }
                  }}
                  initial={{ width: 90, rotate: 0 }}
                  animate={{
                    width: updating.get() ? 24 : 70,
                    rotate: updating.get() ? 360 : 0,
                  }}
                  transition={{
                    width: {
                      ease: [0.25, 0.25, 0, 1],
                    },
                    rotate: updating.get()
                      ? {
                          ease: [0, 0, 0, 0],
                          delay: 0.25,
                          repeatType: 'loop',
                          repeat: Infinity,
                          duration: 3,
                        }
                      : {
                          duration: 0,
                        },
                  }}
                >
                  <motion.p
                    className="sm:text-base text-sm text-center w-full"
                    initial={{ opacity: 1 }}
                    animate={{
                      opacity: updating.get() ? 0 : 1,
                    }}
                    transition={{
                      ease: [0.25, 0.25, 0, 1],
                    }}
                  >
                    Update
                  </motion.p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    );
  }
});

export default Settings;
