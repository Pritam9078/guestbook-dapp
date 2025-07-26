(define-map messages uint
  (tuple
    (sender principal)
    (message (string-utf8 280))
    (timestamp uint)
  )
)

(define-data-var next-id uint u0)

(define-public (post-message (message (string-utf8 280)))
  (let (
    (id (var-get next-id))
    (sender tx-sender)
    (timestamp stacks-block-height)
  )
    (map-set messages id {
      sender: sender,
      message: message,
      timestamp: timestamp
    })
    (var-set next-id (+ id u1))
    (ok id)
  )
)

(define-read-only (get-message (id uint))
  (map-get? messages id)
)
