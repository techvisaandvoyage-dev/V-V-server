const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/LoginPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The chunk we want to replace starts with:
//               {!forgotMode && (
//                 <div className="space-y-3">
//                   <button
//                     type="button"
//                     onClick={handleGoogleLogin}

// And ends with the end of the form:
//                     : "Send OTP"}
//                   </Button>
//                 )}
//               </form>

const startStr = `              {!forgotMode && (
                <div className="space-y-3">`;
                
const endStr = `                  </Button>
                )}
              </form>`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end bounds for replacement.");
  process.exit(1);
}

const before = content.substring(0, startIndex);
const after = content.substring(endIndex + endStr.length);

const replacement = `              <AnimatePresence>
                {error && (
                  <motion.div
                    key="login-error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500 mb-4"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {!forgotMode ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full rounded-full border border-border bg-surface px-4 py-3.5 text-[15px] font-medium text-text-primary transition-colors hover:bg-surface-2 disabled:opacity-60 flex items-center justify-center gap-3"
                  >
                    <GoogleMark />
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={isLoading}
                    className="w-full rounded-full border border-border bg-surface px-4 py-3.5 text-[15px] font-medium text-text-primary transition-colors hover:bg-surface-2 disabled:opacity-60 flex items-center justify-center gap-3"
                  >
                    <FacebookMark />
                    Continue with Facebook
                  </button>

                  {/* OTP Login Accordion */}
                  <div className="rounded-3xl border border-border bg-surface overflow-hidden transition-colors">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod(loginMethod === "otp" ? "" : "otp");
                        clearError();
                      }}
                      className="w-full px-4 py-3.5 text-[15px] font-medium text-text-primary hover:bg-surface-2 flex items-center justify-center gap-3"
                    >
                      <Smartphone size={18} className="text-text-primary" />
                      Log in with phone/Email OTP
                    </button>
                    <AnimatePresence>
                      {loginMethod === "otp" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-1 border-t border-border/30">
                            <form onSubmit={handleRequestOtp} className="space-y-3" noValidate>
                              <Input
                                label=""
                                type="text"
                                inputMode="text"
                                autoComplete="username"
                                placeholder="Email or mobile number"
                                value={otpIdentifier}
                                onChange={(e) => setOtpIdentifier(e.target.value)}
                                className="h-[52px] rounded-full border-border bg-surface px-5 text-[15px] placeholder:text-text-muted focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                required
                              />
                              {otpIdentifier.trim() && (
                                <p className={\`px-4 text-[12px] leading-snug \${otpContactPreview ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}\`}>
                                  {otpContactPreview
                                    ? otpContactPreview.type === "phone"
                                      ? \`We'll text a code — mobile …\${otpContactPreview.value.slice(-4)}\`
                                      : "We'll email a code to this address"
                                    : otpIdentifier.includes("@")
                                      ? "Enter a valid email address"
                                      : "Enter a valid mobile (10 digits, country code optional)"}
                                </p>
                              )}
                              <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                                className="h-[52px] rounded-full bg-cyan text-white hover:bg-cyan-dim text-[15px] font-medium mt-2 shadow-none border-none"
                              >
                                Send OTP
                              </Button>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Email Login Accordion */}
                  <div className="rounded-3xl border border-border bg-surface overflow-hidden transition-colors">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod(loginMethod === "password" ? "" : "password");
                        clearError();
                      }}
                      className="w-full px-4 py-3.5 text-[15px] font-medium text-text-primary hover:bg-surface-2 flex items-center justify-center gap-3"
                    >
                      <KeyRound size={18} className="text-text-primary" />
                      Continue with Email
                    </button>
                    <AnimatePresence>
                      {loginMethod === "password" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-1 border-t border-border/30">
                            <form onSubmit={handlePasswordSubmit} className="space-y-3" noValidate>
                              <Input
                                label=""
                                type="text"
                                placeholder="Email or mobile number"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                autoComplete="username"
                                className="h-[52px] rounded-full border-border bg-surface px-5 text-[15px] placeholder:text-text-muted focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                required
                              />
                              <Input
                                label=""
                                type={showPass ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                className="h-[52px] rounded-full border-border bg-surface px-5 pr-12 text-[15px] placeholder:text-text-muted focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                rightIcon={
                                  <button
                                    type="button"
                                    onClick={() => setShowPass((value) => !value)}
                                    className="hover:text-text-primary text-text-muted transition-colors mr-2 mt-0.5"
                                  >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                                }
                                required
                              />
                              <div className="flex justify-end -mt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForgotMode(true);
                                    const parsed = parseAuthContactInput(identifier.trim());
                                    setForgotEmail(parsed ? parsed.value : identifier.trim());
                                    clearError();
                                  }}
                                  className="text-[13px] text-text-muted transition-colors hover:text-text-primary font-medium"
                                >
                                  Forgot password?
                                </button>
                              </div>
                              <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                                className="h-[52px] rounded-full bg-cyan text-white hover:bg-cyan-dim text-[15px] font-medium mt-2 shadow-none border-none"
                              >
                                Continue
                              </Button>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={forgotStep === 1 ? handleForgotRequestOtp : handleForgotReset}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[15px] font-medium text-text-primary">Forgot Password</p>
                      <button
                        type="button"
                        onClick={resetForgotFlow}
                        className="text-[13px] text-text-muted hover:text-text-primary font-medium"
                      >
                        Cancel
                      </button>
                    </div>

                    {forgotStep === 1 ? (
                      <>
                        <Input
                          label=""
                          type="text"
                          inputMode="text"
                          autoComplete="username"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Registered email or mobile"
                          className="h-[52px] rounded-full border-border bg-surface px-5 text-[15px] placeholder:text-text-muted focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                          required
                        />
                        {forgotEmail.trim() && (
                          <p
                            className={\`px-1 text-[12px] leading-snug \${
                              forgotContactPreview
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }\`}
                          >
                            {forgotContactPreview
                              ? forgotContactPreview.type === "phone"
                                ? \`We'll text a code — mobile …\${forgotContactPreview.value.slice(-4)}\`
                                : "We'll email a reset code to this address"
                              : forgotEmail.includes("@")
                                ? "Enter a valid email address"
                                : "Enter a valid mobile (10 digits, country code optional)"}
                          </p>
                        )}
                        <Button
                          type="submit"
                          variant="primary"
                          fullWidth
                          loading={isLoading}
                          className="h-[52px] rounded-full bg-cyan text-white hover:bg-cyan-dim text-[15px] font-medium shadow-none border-none mt-2"
                        >
                          Send Reset OTP
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-center text-[13px] text-text-secondary px-1">
                          {forgotChannel === "phone" ? (
                            <>
                              Code sent to{" "}
                              <span className="font-semibold text-text-primary">
                                ******{forgotApiIdentifier.slice(-4)}
                              </span>
                            </>
                          ) : (
                            <>
                              Code sent to{" "}
                              <span className="font-semibold text-text-primary">{forgotApiIdentifier}</span>
                            </>
                          )}
                        </p>
                        <label className="block text-center text-[13px] font-medium text-text-secondary">
                          Enter reset OTP
                        </label>
                        {forgotDevOtp.length >= 4 && (
                          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-700">
                            <p className="mb-1 font-medium">Testing mode</p>
                            <p>
                              Reset OTP:{" "}
                              <span className="font-mono font-bold tracking-widest">{forgotDevOtp}</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => setForgotOtpDigits(forgotDevOtp.split("").slice(0, 6))}
                              className="mt-2 font-medium text-amber-700 underline-offset-2 hover:underline"
                            >
                              Fill OTP boxes
                            </button>
                          </div>
                        )}
                        <OtpInput value={forgotOtpDigits} onChange={setForgotOtpDigits} disabled={isLoading} />
                        <div className="text-center">
                          {canResendForgot ? (
                            <button
                              type="button"
                              onClick={handleForgotResendOtp}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-cyan transition-colors hover:text-cyan-dim disabled:opacity-50"
                            >
                              <RefreshCw size={14} />
                              Resend reset OTP
                            </button>
                          ) : (
                            <p className="text-[13px] text-text-muted">
                              Resend available in{" "}
                              <span className="font-mono font-semibold text-text-primary">
                                0:{String(forgotTimeLeft).padStart(2, "0")}
                              </span>
                            </p>
                          )}
                        </div>
                        <Input
                          label=""
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          className="h-[52px] rounded-full border-border bg-surface px-5 text-[15px] placeholder:text-text-muted focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                          required
                        />
                        <div className="flex gap-2 pt-2">
                          <Button type="button" variant="ghost" fullWidth onClick={() => setForgotStep(1)} className="h-[48px] rounded-full text-[15px]">
                            Back
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={isLoading}
                            className="h-[48px] rounded-full bg-cyan text-white hover:bg-cyan-dim text-[15px] shadow-none"
                          >
                            Reset
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </form>
              )}`;

const finalContent = before + replacement + after;

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('LoginPage updated successfully.');
